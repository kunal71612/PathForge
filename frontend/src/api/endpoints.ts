import api from './client';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),

  getMe: () => api.get('/auth/me').then((r) => r.data),
};

export const profileApi = {
  get: () => api.get('/profile').then((r) => r.data),

  update: (data: Record<string, unknown>) =>
    api.put('/profile', data).then((r) => r.data),
};

export const goalsApi = {
  getAll: () => api.get('/goals').then((r) => r.data),
};

export const roadmapsApi = {
  getAll: () => api.get('/roadmaps').then((r) => r.data),
  getById: (id: string) => api.get(`/roadmaps/${id}`).then((r) => r.data),
};

export const resourcesApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/resources', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/resources/${id}`).then((r) => r.data),
  updateProgress: (id: string, status: string) =>
    api.post(`/resources/${id}/progress`, { status }).then((r) => r.data),
  getMyProgress: () => api.get('/learning/progress').then((r) => r.data),
};

export const assessmentsApi = {
  getAll: () => api.get('/assessments').then((r) => r.data),
  getById: (id: string) => api.get(`/assessments/${id}`).then((r) => r.data),
  submit: (id: string, answers: Array<{ questionId: string; selectedAnswer: number }>) =>
    api.post(`/assessments/${id}/submit`, { answers }).then((r) => r.data),
  getAttempts: (assessmentId?: string) =>
    api.get('/assessment-attempts', { params: assessmentId ? { assessmentId } : {} }).then((r) => r.data),
};

export const skillsApi = {
  getAll: () => api.get('/skills').then((r) => r.data),
  getMySkills: () => api.get('/skills/me').then((r) => r.data),
  getProfileSkills: () => api.get('/profile/skills').then((r) => r.data),
  addProfileSkill: (data: { skillId?: string; name?: string; confidence?: number }) =>
    api.post('/profile/skills', data).then((r) => r.data),
  updateProfileSkill: (id: string, data: { confidence?: number }) =>
    api.put(`/profile/skills/${id}`, data).then((r) => r.data),
  deleteProfileSkill: (id: string) =>
    api.delete(`/profile/skills/${id}`).then((r) => r.data),
  getDetail: (id: string) => api.get(`/skills/${id}`).then((r) => r.data),
};

export const opportunitiesApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/opportunities', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/opportunities/${id}`).then((r) => r.data),
  getMatch: (id: string) => api.get(`/opportunities/${id}/match`).then((r) => r.data),
  getGaps: (id: string) => api.get(`/opportunities/${id}/gaps`).then((r) => r.data),
  getRecommended: () => api.get('/opportunities/recommended').then((r) => r.data),
  getSaved: () => api.get('/opportunities/saved').then((r) => r.data),
  save: (id: string, notes?: string) =>
    api.post(`/opportunities/${id}/save`, { notes }).then((r) => r.data),
  unsave: (id: string) =>
    api.delete(`/opportunities/${id}/save`).then((r) => r.data),
  apply: (id: string, notes?: string) =>
    api.post(`/opportunities/${id}/apply`, { notes }).then((r) => r.data),
};

export const applicationsApi = {
  getAll: (status?: string) =>
    api.get('/applications', { params: status ? { status } : {} }).then((r) => r.data),
  create: (opportunityId: string, notes?: string) =>
    api.post('/applications', { opportunityId, notes }).then((r) => r.data),
  update: (id: string, data: { status?: string; notes?: string }) =>
    api.put(`/applications/${id}`, data).then((r) => r.data),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.put(`/applications/${id}/status`, { status, notes }).then((r) => r.data),
  delete: (id: string) => api.delete(`/applications/${id}`).then((r) => r.data),
  getDeadlines: () => api.get('/applications/deadlines').then((r) => r.data),
  getStats: () => api.get('/applications/stats').then((r) => r.data),
};

export const dashboardApi = {
  get: () => api.get('/dashboard').then((r) => r.data),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats').then((r) => r.data),
  getStudents: (search?: string) =>
    api.get('/admin/students', { params: search ? { search } : {} }).then((r) => r.data),

  createOpportunity: (data: Record<string, unknown>) =>
    api.post('/admin/opportunities', data).then((r) => r.data),
  updateOpportunity: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/opportunities/${id}`, data).then((r) => r.data),
  deleteOpportunity: (id: string) =>
    api.delete(`/admin/opportunities/${id}`).then((r) => r.data),

  getResources: () => api.get('/admin/resources').then((r) => r.data),
  createResource: (data: Record<string, unknown>) =>
    api.post('/admin/resources', data).then((r) => r.data),
  updateResource: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/resources/${id}`, data).then((r) => r.data),
  deleteResource: (id: string) =>
    api.delete(`/admin/resources/${id}`).then((r) => r.data),

  getAssessments: () => api.get('/admin/assessments').then((r) => r.data),
  createAssessment: (data: Record<string, unknown>) =>
    api.post('/admin/assessments', data).then((r) => r.data),
  createQuestion: (data: Record<string, unknown>) =>
    api.post('/admin/questions', data).then((r) => r.data),
  deleteQuestion: (id: string) =>
    api.delete(`/admin/questions/${id}`).then((r) => r.data),

  getRoadmaps: () => api.get('/admin/roadmaps').then((r) => r.data),
  createRoadmap: (data: Record<string, unknown>) =>
    api.post('/admin/roadmaps', data).then((r) => r.data),
  deleteRoadmap: (id: string) =>
    api.delete(`/admin/roadmaps/${id}`).then((r) => r.data),
};
