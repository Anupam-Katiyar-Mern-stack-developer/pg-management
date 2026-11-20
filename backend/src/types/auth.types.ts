export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TENANT';

export type PermissionKey =
    | 'can_use_invoicing'
    | 'can_use_ticketing'
    | 'can_use_online_payment';

 
    export interface AdminPermissions {
        allowed_pg_count:number;
        can_use_ticketing:number;
        can_use_online_payment:boolean;
    }

    export interface JwtPayload {
        id:string;
        email:string;
        role:UserRole;
    }

   declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      permissions?: AdminPermissions;
    }
  }
} 