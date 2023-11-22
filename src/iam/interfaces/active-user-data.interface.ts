import { Role } from 'src/users/enums/role.enum';
import { PermissionType } from '../authorization/permission.type';

export interface ActiveUserData {
  /**
   * The "subject" of the token. The value of this property is the user ID.
   */
  sub: number;

  /**
   * The subject's (user) email.
   */
  email: string;

  /**
   * The subject's (user) role.
   */
  role: Role;

  /**
   * The subject's (user) permissions.
   */
  permissions: PermissionType[];
}
