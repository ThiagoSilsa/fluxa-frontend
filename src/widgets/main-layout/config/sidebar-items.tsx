// Icons
import {
  Briefcase,
  Building2,
  Car,
  CarFront,
  ClipboardList,
  Cpu,
  FileUp,
  Home,
  Settings2,
  Users,
} from 'lucide-react'

// Enum
import { PermissionCode } from '#/shared/enum/permission-code'

// Types
import type { SidebarItem } from '../types/sidebar.type'

/**
 * Itens de navegação da sidebar.
 *
 * Permissões seguem o `PermissionCode` (espelho do backend). Itens sem
 * `permissions`/`roles` aparecem para todos os autenticados.
 *
 * As páginas reais ainda não existem: cada caminho leva a uma página
 * placeholder "em construção".
 */
export const sidebarItems: SidebarItem[] = [
  {
    label: 'sidebar.items.home',
    icon: Home,
    path: '/home',
  },
  {
    label: 'sidebar.items.requests',
    icon: ClipboardList,
    path: '/requests',
    permissions: [PermissionCode.MANAGE_ACCESS_REQUESTS, PermissionCode.MANAGE_BLOCK_REQUESTS],
  },
  {
    label: 'sidebar.items.management',
    icon: Settings2,
    children: [
      {
        label: 'sidebar.items.users',
        icon: Users,
        path: '/management/users',
        permissions: [PermissionCode.MANAGE_USERS],
      },
      {
        label: 'sidebar.items.roles',
        icon: Briefcase,
        path: '/management/roles',
        permissions: [PermissionCode.MANAGE_ROLES],
      },
      {
        label: 'sidebar.items.departments',
        icon: Building2,
        path: '/management/departments',
        permissions: [PermissionCode.MANAGE_DEPARTMENTS],
      },
      {
        label: 'sidebar.items.vehicleTypes',
        icon: CarFront,
        path: '/management/vehicle-types',
        permissions: [PermissionCode.MANAGE_VEHICLE_TYPES],
      },
      {
        label: 'sidebar.items.vehicles',
        icon: Car,
        path: '/management/vehicles',
        permissions: [PermissionCode.MANAGE_VEHICLES],
      },
      {
        label: 'sidebar.items.imports',
        icon: FileUp,
        path: '/management/imports',
        permissions: [PermissionCode.MANAGE_IMPORTS],
      },
      {
        label: 'sidebar.items.devices',
        icon: Cpu,
        path: '/management/devices',
        permissions: [PermissionCode.MANAGE_DEVICES],
      },
    ],
  },
]
