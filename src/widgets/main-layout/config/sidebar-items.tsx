// Icons
import {
  Ban,
  Briefcase,
  Building2,
  Car,
  CarFront,
  ClipboardList,
  Cpu,
  DoorOpen,
  FileUp,
  Gauge,
  Home,
  Network,
  Settings2,
  SlidersHorizontal,
  Users,
  Warehouse,
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
 * Fluxo de acesso (M5): Portaria (entrada/saída), Ocupação, Solicitações de
 * acesso e Bloqueios — cada item com as permissões do backend.
 */
export const sidebarItems: SidebarItem[] = [
  {
    label: 'sidebar.items.home',
    icon: Home,
    path: '/home',
  },
  {
    label: 'sidebar.items.portaria',
    icon: Warehouse,
    path: '/portaria',
    permissions: [
      PermissionCode.REGISTER_ENTRY,
      PermissionCode.REGISTER_EXIT,
      PermissionCode.REGISTER_DENIAL,
    ],
  },
  {
    label: 'sidebar.items.ocupacao',
    icon: Gauge,
    path: '/ocupacao',
    permissions: [PermissionCode.VIEW_DASHBOARDS],
  },
  {
    label: 'sidebar.items.blocks',
    icon: Ban,
    path: '/blocks',
    permissions: [PermissionCode.MANAGE_BLOCKS, PermissionCode.CREATE_BLOCK_REQUEST],
  },
  {
    label: 'sidebar.items.requests',
    icon: ClipboardList,
    path: '/requests',
    permissions: [PermissionCode.MANAGE_ACCESS_REQUESTS, PermissionCode.CREATE_ACCESS_REQUEST],
  },
  {
    label: 'sidebar.items.management',
    icon: Settings2,
    // Categoria "Gerenciamento": o pai carrega a **união** das permissões dos
    // filhos — o item aparece quando o usuário tem ao menos uma delas (padrão
    // do projeto de referência), e os filhos continuam filtrados por permissão.
    permissions: [
      PermissionCode.MANAGE_USERS,
      PermissionCode.MANAGE_ROLES,
      PermissionCode.MANAGE_DEPARTMENTS,
      PermissionCode.MANAGE_ENTRANCES,
      PermissionCode.MANAGE_VEHICLE_TYPES,
      PermissionCode.MANAGE_VEHICLES,
    ],
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
        label: 'sidebar.items.entrances',
        icon: DoorOpen,
        path: '/management/entrances',
        permissions: [PermissionCode.MANAGE_ENTRANCES],
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
    ],
  },
  {
    label: 'sidebar.items.connections',
    icon: Network,
    permissions: [PermissionCode.MANAGE_DEVICES],
    children: [
      {
        label: 'sidebar.items.devices',
        icon: Cpu,
        path: '/management/devices',
        permissions: [PermissionCode.MANAGE_DEVICES],
      },
    ],
  },
  {
    label: 'sidebar.items.configurations',
    icon: SlidersHorizontal,
    permissions: [PermissionCode.MANAGE_IMPORTS],
    children: [
      {
        label: 'sidebar.items.imports',
        icon: FileUp,
        path: '/management/imports',
        permissions: [PermissionCode.MANAGE_IMPORTS],
      },
    ],
  },
]
