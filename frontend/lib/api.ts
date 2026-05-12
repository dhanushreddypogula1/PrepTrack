import axios from "axios";
import type {
  Profile,
  Prediction,
  MatchResult,
  ExamConfig,
  ExamAttempt,
  ExamResult,
  ResumeAnalysis,
  ProgressLog,
} from "@/types";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000",
});

// Inject token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      try {
        const store = JSON.parse(
          localStorage.getItem(
            "preptrack-store"
          ) || "{}"
        );
        if (store?.state?.token)
          config.headers.Authorization = `Bearer ${store.state.token}`;
      } catch {}
    }
    return config;
  }
);

// Auth
export const apiLogin = (
  u: string,
  p: string
) =>
  api
    .post("/api/auth/login", {
      username: u,
      password: p,
    })
    .then((r) => r.data);

export const apiRegister = (
  username: string,
  email: string,
  password: string
) =>
  api
    .post("/api/auth/register", {
      username,
      email,
      password,
    })
    .then((r) => r.data);

export const apiMe = () =>
  api.get("/api/auth/me").then((r) => r.data);

// Predict
export const apiPredict = (
  profile: Profile
): Promise<Prediction> =>
  api
    .post("/api/predict/", profile)
    .then((r) => r.data);

export const apiScenarios = (
  profile: Profile,
  scenarios: {
    label: string;
    changes: Record<string, any>;
  }[]
) =>
  api
    .post("/api/predict/scenarios", {
      profile,
      scenarios,
    })
    .then((r) => r.data);

export const apiHistory = () =>
  api
    .get("/api/predict/history")
    .then((r) => r.data);

// Advisor
export const apiAdvisorReport = (
  profile: Profile,
  prob: number,
  ctc: number
) =>
  api
    .post("/api/advisor/report", {
      profile,
      placement_probability: prob,
      predicted_ctc: ctc,
    })
    .then((r) => r.data.text);

export const apiRoadmap = (
  profile: Profile,
  target_company: string
) =>
  api
    .post("/api/advisor/roadmap", {
      profile,
      target_company,
    })
    .then((r) => r.data.text);

export const apiBullet = (
  bullet: string
) =>
  api
    .post("/api/advisor/bullet", {
      bullet,
    })
    .then((r) => r.data.text);

export const apiInterviewQ = (
  domain: string,
  company: string,
  difficulty: string
) =>
  api
    .post("/api/advisor/interview/question", {
      domain,
      company,
      difficulty,
    })
    .then((r) => r.data);

export const apiInterviewEval = (
  question: string,
  answer: string,
  domain: string
) =>
  api
    .post("/api/advisor/interview/evaluate", {
      question,
      answer,
      domain,
    })
    .then((r) => r.data);

// Companies
export const apiMatchAll = (
  profile: Profile,
  base_probability: number
): Promise<MatchResult> =>
  api
    .post("/api/companies/match", {
      profile,
      base_probability,
    })
    .then((r) => r.data);

export const apiMatchOne = (
  company: string,
  profile: Profile,
  base_probability: number
) =>
  api
    .post(
      `/api/companies/match/${company}`,
      { profile, base_probability }
    )
    .then((r) => r.data);

export const apiCompanyRoadmap = (
  company: string,
  profile: Profile,
  base_probability: number
) =>
  api
    .post(
      `/api/companies/roadmap/${company}`,
      { profile, base_probability }
    )
    .then((r) => r.data.text);

export const apiCompareCompanies = (
  profile: Profile,
  company_names: string[],
  base_probability: number
) =>
  api
    .post("/api/companies/compare", {
      profile,
      company_names,
      base_probability,
    })
    .then((r) => r.data.text);

// Exam
export const apiStartExam = (
  config: ExamConfig
): Promise<ExamAttempt> =>
  api
    .post("/api/exam/start", config)
    .then((r) => r.data);

export const apiSubmitExam = (
  attempt_id: number,
  answers: Record<number, string>,
  time_taken_seconds: number,
  tab_switches: number
): Promise<ExamResult> =>
  api
    .post("/api/exam/submit", {
      attempt_id,
      answers,
      time_taken_seconds,
      tab_switches,
    })
    .then((r) => r.data);

export const apiExamHistory = () =>
  api
    .get("/api/exam/history")
    .then((r) => r.data);

// Chat
export const apiChat = (
  message: string,
  history: {
    role: string;
    content: string;
  }[]
) =>
  api
    .post("/api/chat/", {
      message,
      history,
    })
    .then((r) => r.data);

export const apiChatHistory = () =>
  api
    .get("/api/chat/history")
    .then((r) => r.data);

// LeetCode
export const apiLeetcode = (
  username: string
) =>
  api
    .get(`/api/leetcode/${username}`)
    .then((r) => r.data);

// Resume
export const apiAnalyzeResume = (
  file: File
): Promise<ResumeAnalysis> => {
  const form = new FormData();
  form.append("file", file);
  return api
    .post("/api/resume/analyze", form, {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    })
    .then((r) => r.data);
};

// Progress
export const apiLogProgress = (
  data: {
    activity_type: string;
    description: string;
    duration_minutes: number;
  }
) =>
  api
    .post("/api/progress/", data)
    .then((r) => r.data);

export const apiGetProgress = (): Promise<
  ProgressLog[]
> =>
  api
    .get("/api/progress/")
    .then((r) => r.data);

export default api;
