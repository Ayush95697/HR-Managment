import client from './client';

export interface TaskVelocityDto {
  bucket: string;
  count: number;
}

export interface DepartmentDistributionDto {
  department: string;
  headCount: number;
}

export interface WorkloadBalanceDto {
  userId: string;
  userName: string;
  high: number;
  critical: number;
}

export interface ActivityFeedItemDto {
  id?: string;
  timestamp: string;
  message: string;
  kind: string;
}

export const dashboardApi = {
  getTaskVelocity: (range: number = 30, interval: string = 'day') =>
    client.get<TaskVelocityDto[]>('/dashboard/task-velocity', { params: { range, interval } }).then((r) => r.data),

  getDepartmentDistribution: () =>
    client.get<DepartmentDistributionDto[]>('/dashboard/department-distribution').then((r) => r.data),

  getWorkloadBalance: () =>
    client.get<WorkloadBalanceDto[]>('/dashboard/workload-balance').then((r) => r.data),

  getActivityFeed: (page: number = 1, pageSize: number = 20) =>
    client.get<ActivityFeedItemDto[]>('/dashboard/activity-feed', { params: { page, pageSize } }).then((r) => r.data),
};
