from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter()

LEETCODE_API = "https://leetcode.com/graphql"

QUERY = """
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username

    profile {
      ranking
      reputation
      starRating
      userAvatar
      realName
      aboutMe
      school
      websites
      countryName
      company
      jobTitle
      skillTags
      postViewCount
      postViewCountDiff
      reputationDiff
      solutionCount
      solutionCountDiff
      categoryDiscussCount
      categoryDiscussCountDiff
    }

    submitStats {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
    }

    badges {
      id
      displayName
      icon
      creationDate
    }

    languageProblemCount {
      languageName
      problemsSolved
    }

    tagProblemCounts {
      advanced {
        tagName
        problemsSolved
      }

      intermediate {
        tagName
        problemsSolved
      }

      fundamental {
        tagName
        problemsSolved
      }
    }
  }

  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    totalParticipants
    topPercentage

    badge {
      name
    }
  }

  recentSubmissionList(username: $username) {
    title
    titleSlug
    timestamp
    statusDisplay
    lang
  }
}
"""


@router.get("/{username}")
async def get_leetcode_profile(username: str):
    try:
        payload = {
            "query": QUERY,
            "variables": {
                "username": username
            }
        }

        headers = {
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com",
            "User-Agent": "Mozilla/5.0",
        }

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                LEETCODE_API,
                json=payload,
                headers=headers,
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch LeetCode data",
            )

        json_data = response.json()

        data = json_data.get("data") or {}

        if not data:
            raise HTTPException(
                status_code=404,
                detail="LeetCode user not found",
            )

        user = data.get("matchedUser") or {}

        if not user:
            raise HTTPException(
                status_code=404,
                detail="LeetCode user not found",
            )

        profile = user.get("profile") or {}

        submit_stats = (
            user.get("submitStats") or {}
        )

        ac_stats = (
            submit_stats.get(
                "acSubmissionNum"
            )
            or []
        )

        solved = {
            item.get(
                "difficulty",
                "Unknown"
            ): item.get("count", 0)
            for item in ac_stats
        }

        contest = (
            data.get(
                "userContestRanking"
            )
            or {}
        )

        badges = (
            user.get("badges")
            or []
        )

        languages = (
            user.get(
                "languageProblemCount"
            )
            or []
        )

        topics = (
            user.get(
                "tagProblemCounts"
            )
            or {}
        )

        recent_submissions = (
            data.get(
                "recentSubmissionList"
            )
            or []
        )

        return {
            "username": user.get(
                "username",
                username,
            ),

            "profile": {
                "ranking": profile.get(
                    "ranking"
                ),
                "reputation": profile.get(
                    "reputation"
                ),
                "starRating": profile.get(
                    "starRating"
                ),
                "avatar": profile.get(
                    "userAvatar"
                ),
                "realName": profile.get(
                    "realName"
                ),
                "aboutMe": profile.get(
                    "aboutMe"
                ),
                "school": profile.get(
                    "school"
                ),
                "country": profile.get(
                    "countryName"
                ),
                "company": profile.get(
                    "company"
                ),
                "jobTitle": profile.get(
                    "jobTitle"
                ),
                "skillTags": profile.get(
                    "skillTags",
                    [],
                ),
            },

            "solved": {
                "all": solved.get(
                    "All",
                    0,
                ),
                "easy": solved.get(
                    "Easy",
                    0,
                ),
                "medium": solved.get(
                    "Medium",
                    0,
                ),
                "hard": solved.get(
                    "Hard",
                    0,
                ),
            },

            "contest": {
                "rating": contest.get(
                    "rating",
                    0,
                ),
                "globalRanking": contest.get(
                    "globalRanking",
                    "N/A",
                ),
                "topPercentage": contest.get(
                    "topPercentage",
                    0,
                ),
                "attended": contest.get(
                    "attendedContestsCount",
                    0,
                ),
                "badge": (
                    contest.get(
                        "badge"
                    )
                    or {}
                ).get(
                    "name"
                ),
            },

            "badges": badges,

            "languages": languages,

            "topics": topics,

            "recentSubmissions": recent_submissions,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"LeetCode API Error: {str(e)}",
        )