export type ItemStatus =
  | 'Operativo'
  | 'En Mantención'
  | 'En Reparación'
  | 'De Baja'
  | 'Desaparecido';

export interface Item {
  id: string;
  name: string;
  category_id: string;
  location_id: string;
  status: ItemStatus;
  stock: number;
  unit: string;
  is_consumable: boolean;
  serial_number?: string;
  qr_code?: string;
}

export type MovementType = 'PRESTAMO' | 'DEVOLUCION' | 'PEDIDO';

export type SchoolType =
  | 'Construcción'
  | 'Mecánica'
  | 'Administración'
  | 'Informática'
  | 'Salud'
  | 'Turismo'
  | 'Naturaleza';

export type RoleName = 'Usuario Global' | 'Alumno Líder' | 'Administrador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  is_blocked: boolean;
  school?: SchoolType;
}