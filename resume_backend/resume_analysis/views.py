from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.utils import timezone

import os
import tempfile
import logging

from coreengine.controller import process_resume
from coreengine.jobdescription import get_default_jd

logger = logging.getLogger(__name__)


class ResumeAnalysisView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS = {".pdf", ".docx"}
    ALLOWED_CONTENT_TYPES = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }

    def post(self, request):
        file = request.FILES.get("file")
        jd_requirement = request.data.get("job_description")
        ai_enabled = request.data.get("ai_enabled", "false").lower() == "true"

        # ---------------------------
        # FILE VALIDATION
        # ---------------------------

        if not file:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "NO_FILE",
                        "message": "No file uploaded."
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        _, ext = os.path.splitext(file.name.lower())
        if ext not in self.ALLOWED_EXTENSIONS:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "UNSUPPORTED_FILE_TYPE",
                        "message": "Only PDF and DOCX files are supported."
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if file.content_type not in self.ALLOWED_CONTENT_TYPES:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "INVALID_CONTENT_TYPE",
                        "message": "Invalid file content type."
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if file.size > self.MAX_FILE_SIZE:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "FILE_TOO_LARGE",
                        "message": "File size exceeds 5MB limit."
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ---------------------------
        # SAVE TEMP FILE
        # ---------------------------

        _, ext = os.path.splitext(file.name.lower())
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            for chunk in file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        try:
            # ---------------------------
            # JD NORMALIZATION (Policy Layer)
            # ---------------------------

            if jd_requirement:
                jd_line = jd_requirement.replace("\n", " ").strip()
                jd_requirements = [jd_line] if jd_line else get_default_jd()
            else:
                jd_requirements = get_default_jd()

            # ---------------------------
            # PROCESS ENGINE
            # ---------------------------

            result = process_resume(
                temp_file_path,
                ai_enabled=ai_enabled,
                jd_requirements=jd_requirements
            )

            if result.get("error"):
                return Response(
                    {
                        "success": False,
                        "error": {
                            "code": "PROCESSING_FAILED",
                            "message": "Unable to process resume."
                        }
                    },
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY
                )

            # ---------------------------
            # DERIVED INSIGHTS
            # ---------------------------

            skills = result.get("skills", {})
            evaluation = result.get("evaluation", {})
            experience_score = float(result.get("experience_score") or 0)

            # Strongest domains
            strong_domains = sorted(
                skills.keys(),
                key=lambda d: sum(skills[d].values()),
                reverse=True
            )[:2]

            # Experience tier
            years_exp = result.get("evaluation", {}).get("experience_score", 0)
            if years_exp < 20:
                experience_level = "fresher"
            elif years_exp < 50:
                experience_level = "junior"
            elif years_exp < 75:
                experience_level = "mid"
            else:
                experience_level = "senior"

            # ---------------------------
            # FINAL RESPONSE
            # ---------------------------

            response_data = {
                "success": True,
                "data": {
                    "analyzed_at": timezone.now(),
                    "scores": {
                        "final": float(result.get("final_score") or 0),
                        "breakdown": {
                            "rule": float(evaluation.get("rule_score") or 0),
                            "semantic": float(result.get("semantic_score") or 0),
                            "experience": experience_score,
                        },
                        "confidence": float(result.get("confidence") or 0),
                    },
                    "profile": {
                        "experience_level": experience_level,
                        "strong_domains": strong_domains,
                    },
                    "skills_summary": evaluation.get("skill_metrics") or {
                        "total_unique": 0,
                        "total_mentions": 0,
                        "domain_diversity": 0,
                    },
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Resume processing failed: %s", str(e))
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "INTERNAL_ERROR",
                        "message": "Something went wrong while analyzing the resume."
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
