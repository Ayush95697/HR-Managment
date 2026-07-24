import client from './client';

export interface GlobalSearchResultDto {
  tasks: SearchTaskDto[];
  boards: SearchBoardDto[];
  employees: SearchEmployeeDto[];
  departments: SearchDepartmentDto[];
}

export interface SearchTaskDto {
  id: string;
  boardId: string;
  title: string;
  boardName: string;
  status: string;
}

export interface SearchEmployeeDto {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentName?: string;
  managerName?: string;
  isActive: boolean;
  avatarUrl?: string;
}

export interface SearchBoardDto {
  id: string;
  name: string;
  departmentName?: string;
  ownerName: string;
}

export interface SearchDepartmentDto {
  id: string;
  name: string;
}

export const searchApi = {
  globalSearch: (query: string) => {
    return client.get<GlobalSearchResultDto>('/search', {
      params: { q: query },
    }).then((r: { data: GlobalSearchResultDto }) => r.data);
  },
};
