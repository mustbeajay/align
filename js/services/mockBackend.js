const DB_KEYS = {
  USERS: "align_users",
  SESSION: "align_session",
  PROJECTS: "align_projects",
};

class MockBackend {
  constructor() {
    if (!localStorage.getItem(DB_KEYS.USERS))
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify([]));
    if (!localStorage.getItem(DB_KEYS.PROJECTS))
      localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify([]));
  }

  _getUsers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS));
  }
  _saveUsers(users) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }

  async register(name, email, password, avatarId) {
    await new Promise((r) => setTimeout(r, 600));
    const users = this._getUsers();
    if (users.length >= 3)
      return { success: false, error: "Browser limit reached." };
    if (users.find((u) => u.email === email))
      return { success: false, error: "Email exists." };

    const newUser = {
      id: "u_" + Date.now(),
      name,
      email,
      password,
      avatarId,
      preferences: { theme: "light", accent: "#FCA5A5" },
    };
    users.push(newUser);
    this._saveUsers(users);
    await this.login(email, password);
    return { success: true, user: newUser };
  }

  async login(email, password) {
    await new Promise((r) => setTimeout(r, 600));
    const users = this._getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (user) {
      const session = { userId: user.id, token: "mock_" + Date.now() };
      localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(session));
      return { success: true, user };
    }
    return { success: false, error: "Invalid credentials." };
  }

  logout() {
    localStorage.removeItem(DB_KEYS.SESSION);
    window.location.href = "index.html";
  }

  getCurrentUser() {
    const sessionStr = localStorage.getItem(DB_KEYS.SESSION);
    if (!sessionStr) return null;
    const session = JSON.parse(sessionStr);
    return this._getUsers().find((u) => u.id === session.userId) || null;
  }

  async updateUser(userId, updates, currentPassword) {
    await new Promise((r) => setTimeout(r, 500));
    const users = this._getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return { success: false, error: "User not found" };

    const user = users[index];
    const isSensitive =
      (updates.email && updates.email !== user.email) || updates.password;
    if (isSensitive && user.password !== currentPassword)
      return { success: false, error: "Incorrect password." };

    users[index] = { ...user, ...updates };
    this._saveUsers(users);
    return { success: true, user: users[index] };
  }

  async deleteUser(userId) {
    let users = this._getUsers().filter((u) => u.id !== userId);
    this._saveUsers(users);
    let projects = JSON.parse(localStorage.getItem(DB_KEYS.PROJECTS)).filter(
      (p) => p.userId !== userId,
    );
    localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(projects));
    this.logout();
    return { success: true };
  }

  getUserProjects(userId) {
    const all = JSON.parse(localStorage.getItem(DB_KEYS.PROJECTS));
    return all
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async createProject(userId, name) {
    await new Promise((r) => setTimeout(r, 400));
    const all = JSON.parse(localStorage.getItem(DB_KEYS.PROJECTS));
    const newProject = {
      id: "p_" + Date.now(),
      userId,
      name,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      data: [],
    };
    all.push(newProject);
    localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(all));
    return { success: true, project: newProject };
  }

  async deleteProject(projectId) {
    const all = JSON.parse(localStorage.getItem(DB_KEYS.PROJECTS));
    const filtered = all.filter((p) => p.id !== projectId);
    localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(filtered));
    return { success: true };
  }

  isProjectNameUnique(userId, name) {
    return !this.getUserProjects(userId).some(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async saveProject(projectId, elementData) {
    const all = JSON.parse(localStorage.getItem(DB_KEYS.PROJECTS));
    const index = all.findIndex((p) => p.id === projectId);
    if (index !== -1) {
      all[index].data = elementData;
      all[index].updatedAt = Date.now();
      localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(all));
      return { success: true };
    }
    return { success: false };
  }
}

export const backend = new MockBackend();
