import { API_BASE_URL } from "./fetch";

function absolute(path) {
  return `${API_BASE_URL}${path}`;
}

export const API_ROUTES = {
  auth: {
    register: absolute("/auth/register"),
    login: absolute("/auth/login"),
    logout: absolute("/auth/logout"),
  },
  alerts: {
    list: absolute("/alerts"),
    detail: (id) => absolute(`/alerts/${id}`),
    markAsRead: (id) => absolute(`/alerts/${id}/read`),
    remove: (id) => absolute(`/alerts/${id}`),
  },
  clients: {
    list: absolute("/clients"),
    detail: (id) => absolute(`/clients/${id}`),
    create: absolute("/clients"),
    update: (id) => absolute(`/clients/${id}`),
    remove: (id) => absolute(`/clients/${id}`),
  },
  consents: {
    create: absolute("/consents"),
    byUser: (idUser) => absolute(`/consents/user/${idUser}`),
    revoke: absolute("/consents/revoke"),
  },
  geofences: {
    create: absolute("/geofences"),
    list: absolute("/geofences"),
    detail: (id) => absolute(`/geofences/${id}`),
    update: (id) => absolute(`/geofences/${id}`),
    remove: (id) => absolute(`/geofences/${id}`),
  },
  locations: {
    sync: absolute("/locations/sync"),
    latest: (userId) => absolute(`/locations/latest/${userId}`),
    history: (userId) => absolute(`/locations/history/${userId}`),
  },
  reports: {
    route: (userId) => absolute(`/reports/route/${userId}`),
    stats: (userId) => absolute(`/reports/stats/${userId}`),
    alerts: (userId) => absolute(`/reports/alerts/${userId}`),
    geofenceEvents: (userId) => absolute(`/reports/geofence-events/${userId}`),
    exportPdf: (userId) => absolute(`/reports/export/pdf/${userId}`),
    exportExcel: (userId) => absolute(`/reports/export/excel/${userId}`),
  },
  users: {
    list: absolute("/users"),
    detail: (id) => absolute(`/users/${id}`),
    update: (id) => absolute(`/users/${id}`),
    remove: (id) => absolute(`/users/${id}`),
  },
  userClients: {
    assign: absolute("/user-clients"),
    remove: (idUser, idClient) => absolute(`/user-clients/${idUser}/${idClient}`),
    clientsByUser: (idUser) => absolute(`/user-clients/user/${idUser}/clients`),
    usersByClient: (idClient) => absolute(`/user-clients/client/${idClient}/users`),
  },
  supervisorUsers: {
    assign: absolute("/supervisor-users"),
    remove: (idSupervisor, idUser) =>
      absolute(`/supervisor-users/${idSupervisor}/${idUser}`),
    usersBySupervisor: (idSupervisor) =>
      absolute(`/supervisor-users/supervisor/${idSupervisor}/users`),
    supervisorsByUser: (idUser) => absolute(`/supervisor-users/user/${idUser}/supervisors`),
  },
};
