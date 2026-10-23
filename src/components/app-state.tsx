'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { toast } from 'sonner';

export type SessionRole = 'ADMIN' | 'AYUDANTE' | 'GLOBAL';
export type AssetCategory = string;
export type AssetUnit = 'UNID' | 'KG';
export type OrderStatus =
  | 'Solicitado'
  | 'Aceptado'
  | 'Preparado'
  | 'Enviado'
  | 'Recibido'
  | 'Rechazado';
export type MovementType = 'PRESTAMO' | 'DEVOLUCION' | 'PEDIDO' | 'BAJA';

export interface AssetRecord {
  code: string;
  name: string;
  image: string;
  category: AssetCategory;
  location: string;
  unitType: AssetUnit;
  returnable: boolean;
  available: number;
  total: number;
  description: string;
  status: string;
}

export interface MemberRecord {
  id: string;
  name: string;
  email: string;
  run: string;
  role: string;
  school: string;
  blocked: boolean;
  loans: number;
  overdueDays: number;
}

export type SessionProfile = Pick<MemberRecord, 'name' | 'email' | 'run' | 'role' | 'school'>;

export interface OrderEvent {
  action: string;
  actor: string;
  date: string;
  observation?: string;
}

export interface OrderRecord {
  id: string;
  assetCode: string;
  assetName: string;
  quantity: number;
  unit: string;
  requester: string;
  run: string;
  email: string;
  school: string;
  notes: string;
  status: OrderStatus;
  movementType?: MovementType;
  createdAt: string;
  returnDate: string;
  signatureData?: string;
  ownerRole: SessionRole;
  stockDeducted: boolean;
  history: OrderEvent[];
}

export interface WorkOrder {
  id: string;
  asset: string;
  category: string;
  type: 'Preventivo' | 'Correctivo';
  description: string;
  technician: string;
  date: string;
  status: 'Diagnóstico' | 'En Proceso' | 'Esperando Repuesto' | 'Finalizada';
  observations: string[];
}

export interface SystemSettings {
  campus: string;
  studentLoanHours: number;
  staffLoanDays: number;
  studentEquipmentLimit: number;
  overdueBlockDays: number;
  lowStockThreshold: number;
  replenishmentEmail: string;
  emailNotifications: boolean;
  strictDigitalSignature: boolean;
  automaticOverdueBlock: boolean;
  categories: { name: string; prefix: string }[];
  lockers: { name: string; status: string }[];
}

export interface AppData {
  assets: AssetRecord[];
  members: MemberRecord[];
  orders: OrderRecord[];
  workOrders: WorkOrder[];
  settings: SystemSettings;
  dismissedAlerts: string[];
}

const defaultAssetImageByCategory: Record<string, string> = {
  Equipamiento: '/assets/kit-arduino-uno-r3.jpg',
  '3D': '/assets/filamento-pla-negro.jpg',
  Talleres: '/assets/estacion-soldar-weller-60w.jpg',
  Mobiliario: '/assets/sillas-plegables.jpg',
};

const defaultAssetImageByCode: Record<string, string> = {
  'EQ-CITT-089': defaultAssetImageByCategory.Equipamiento,
  'TA-CITT-012': defaultAssetImageByCategory.Talleres,
};

const demoProfiles: Record<SessionRole, Omit<MemberRecord, 'id' | 'blocked' | 'loans' | 'overdueDays'>> = {
  ADMIN: {
    name: 'Paz Constanza Morales Saavedra',
    email: 'pc.morales@profesor.duoc.cl',
    run: '16.321.654-8',
    role: 'Administrador',
    school: 'Administración',
  },
  AYUDANTE: {
    name: 'Rocío Torres',
    email: 'rocio.torres@duocuc.cl',
    run: '19.882.112-k',
    role: 'Alumno Líder',
    school: 'Informática',
  },
  GLOBAL: {
    name: 'Camila Soto',
    email: 'camila.soto@duocuc.cl',
    run: '18.765.432-1',
    role: 'Usuario Global',
    school: 'Administración',
  },
};

const initialData: AppData = {
  assets: [
    {
      code: 'EQ-CITT-089',
      name: 'Kit Arduino Uno R3 Project',
      image: defaultAssetImageByCode['EQ-CITT-089'],
      category: 'Equipamiento',
      location: 'Casillero A-02',
      unitType: 'UNID',
      returnable: true,
      available: 12,
      total: 15,
      description: 'Kit de microcontrolador, protoboard, servomotor y jumpers para prácticas.',
      status: 'Disponible',
    },
    {
      code: '3D-CITT-005',
      name: 'Filamento PLA 1.75mm Negro',
      image: defaultAssetImageByCategory['3D'],
      category: '3D',
      location: 'Casillero B-04',
      unitType: 'KG',
      returnable: false,
      available: 9.95,
      total: 10,
      description: 'Bobina PLA. Los pedidos se descuentan en gramos del stock en kilogramos.',
      status: 'Disponible',
    },
    {
      code: 'TA-CITT-012',
      name: 'Estación de Soldar Weller 60W',
      image: defaultAssetImageByCode['TA-CITT-012'],
      category: 'Talleres',
      location: 'Casillero C-01',
      unitType: 'UNID',
      returnable: true,
      available: 1,
      total: 3,
      description: 'Estación de soldadura con control de temperatura.',
      status: 'En Préstamo',
    },
    {
      code: 'IM-CITT-001',
      name: 'Sillas Plateadas Plegables CITT',
      image: defaultAssetImageByCategory.Mobiliario,
      category: 'Mobiliario',
      location: 'Sin casillero / Mobiliario CITT',
      unitType: 'UNID',
      returnable: true,
      available: 0,
      total: 8,
      description: 'Mobiliario de libre disposición en sala CITT.',
      status: 'Stock Crítico',
    },
  ],
  members: [
    { id: 'M-001', name: 'Rocío Torres', email: 'rocio.torres@duocuc.cl', run: '19.882.112-k', role: 'Alumno Líder', school: 'Informática', blocked: false, loans: 2, overdueDays: 0 },
    { id: 'M-002', name: 'Matías Tapia', email: 'matias.tapia@duocuc.cl', run: '20.112.334-3', role: 'Alumno', school: 'Mecánica', blocked: true, loans: 1, overdueDays: 3 },
    { id: 'M-003', name: 'Camila Soto', email: 'camila.soto@duocuc.cl', run: '18.765.432-1', role: 'Docente', school: 'Administración', blocked: false, loans: 0, overdueDays: 0 },
    { id: 'M-005', name: 'Andrés Rojas', email: 'andres.rojas@duocuc.cl', run: '21.456.789-2', role: 'Alumno', school: 'Construcción', blocked: true, loans: 2, overdueDays: 2 },
    { id: 'M-004', name: 'Paz Constanza Morales Saavedra', email: 'pc.morales@profesor.duoc.cl', run: '16.321.654-8', role: 'Administrador', school: 'Administración', blocked: false, loans: 0, overdueDays: 0 },
  ],
  orders: [],
  workOrders: [
    { id: 'OT-2026-001', asset: 'Fuente Poder Regulada 30V', category: 'Equipamiento', type: 'Preventivo', description: 'Calibración de voltaje de salida y cambio de fusible interno.', technician: 'Lab Electrónica', date: '2026-10-20', status: 'En Proceso', observations: [] },
    { id: 'OT-2026-002', asset: 'Impresora 3D Ender 3 V2 (#02)', category: '3D', type: 'Correctivo', description: 'Boquilla obstruida y desalineación de eje Z.', technician: 'FabLab CITT', date: '2026-10-18', status: 'Diagnóstico', observations: [] },
    { id: 'OT-2026-003', asset: 'Osciloscopio Rigol 50MHz (#01)', category: 'Equipamiento', type: 'Preventivo', description: 'Limpieza de conectores BNC y reemplazo de puntas.', technician: 'Servicio técnico', date: '2026-10-12', status: 'Finalizada', observations: [] },
    { id: 'OT-2026-004', asset: 'Estación de Soldar Hakko FX-888D', category: 'Talleres', type: 'Correctivo', description: 'Fallo en la resistencia calefactora del mango cautín.', technician: 'Soporte Técnico Sede', date: '2026-10-21', status: 'Esperando Repuesto', observations: [] },
  ],
  settings: {
    campus: 'CITT Duoc UC - Sede San Bernardo',
    studentLoanHours: 5,
    staffLoanDays: 7,
    studentEquipmentLimit: 3,
    overdueBlockDays: 2,
    lowStockThreshold: 15,
    replenishmentEmail: 'pc.morales@profesor.duoc.cl',
    emailNotifications: true,
    strictDigitalSignature: true,
    automaticOverdueBlock: true,
    categories: [
      { name: 'Mobiliario', prefix: 'IM-CITT-' },
      { name: '3D', prefix: '3D-CITT-' },
      { name: 'Talleres', prefix: 'TA-CITT-' },
      { name: 'Equipamiento', prefix: 'EQ-CITT-' },
    ],
    lockers: [
      { name: 'Casillero 01', status: 'Disponible' },
      { name: 'Casillero 02', status: 'Ocupado' },
      { name: 'Casillero 03', status: 'Disponible' },
      { name: 'Casillero 04', status: 'Disponible' },
      { name: 'Sin Casillero', status: 'Excepción' },
    ],
  },
  dismissedAlerts: [],
};

interface AppStateValue {
  role: SessionRole;
  setRole: Dispatch<SetStateAction<SessionRole>>;
  currentUser: SessionProfile;
  setSessionUser: Dispatch<SetStateAction<SessionProfile | null>>;
  data: AppData;
  setData: Dispatch<SetStateAction<AppData>>;
}

const AppStateContext = createContext<AppStateValue | null>(null);
const storageKey = 'citt-stock-frontend-state';

function isAppData(value: unknown): value is { role?: SessionRole; data?: AppData } {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { role?: unknown; data?: unknown };
  if (candidate.role !== undefined && !['ADMIN', 'AYUDANTE', 'GLOBAL'].includes(String(candidate.role))) return false;
  if (candidate.data === undefined) return true;
  if (!candidate.data || typeof candidate.data !== 'object') return false;
  const data = candidate.data as Partial<AppData>;
  return Array.isArray(data.assets) && Array.isArray(data.members) &&
    Array.isArray(data.orders) && Array.isArray(data.workOrders) &&
    Boolean(data.settings && Array.isArray(data.dismissedAlerts));
}

function addMissingAssetImages(data: AppData): AppData {
  return {
    ...data,
    assets: data.assets.map((asset) => ({
      ...asset,
      image: defaultAssetImageByCode[asset.code] ||
        asset.image ||
        defaultAssetImageByCategory[asset.category] ||
        defaultAssetImageByCategory.Equipamiento,
    })),
  };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<SessionRole>('ADMIN');
  const [sessionUser, setSessionUser] = useState<SessionProfile | null>(null);
  const [data, setData] = useState<AppData>(initialData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!isAppData(parsed)) throw new Error('La estructura de datos guardada no es válida.');
        // These updates hydrate browser-persisted state after the server render.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.role) setRole(parsed.role);
        if (parsed.data) setData(addMissingAssetImages(parsed.data));
      }
    } catch (error) {
      console.error('No se pudieron cargar los datos guardados de CITT Stock.', error);
      toast.error('No se pudieron cargar los datos guardados del navegador.');
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ role, data }));
    } catch (error) {
      console.error('No se pudieron guardar los datos de CITT Stock.', error);
      toast.error('No se pudieron guardar los cambios en este navegador.');
    }
  }, [data, hydrated, role]);

  return (
    <AppStateContext.Provider value={{ role, setRole, currentUser: sessionUser ?? demoProfiles[role], setSessionUser, data, setData }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState debe usarse dentro de AppStateProvider.');
  return context;
}
