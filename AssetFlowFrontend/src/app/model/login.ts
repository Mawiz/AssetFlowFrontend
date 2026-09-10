interface LoginDto {
  userName: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  result: {
    isReset: boolean;
    token: string;
    user: {
      id: number;
      fullName: string;
      userName: string;
      email: string;
      roleId: number;
      isActive: boolean;
      pageSize: number;
    };
    permissions: string[];
    menuItems: string[];
    navigationItems: string[];
    navigationCreateItems: string[];
  };
}
