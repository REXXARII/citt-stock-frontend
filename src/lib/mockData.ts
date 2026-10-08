
// 1. Contrato del Catálogo de Activos
export const mockItems = {
  data: [
    {
      id: "11111111-2222-3333-4444-555555555555",
      tenant_id: "00000000-0000-0000-0000-000000000001",
      category: { id: "cat-01", name: "Impresión 3D" },
      location: { id: "loc-01", name: "Casillero A1" },
      code: "3D-CITT-001",
      name: "Bobina Filamento PLA Blanco",
      status: "OPERATIVE"
    },
    {
      id: "22222222-3333-4444-5555-666666666666",
      tenant_id: "00000000-0000-0000-0000-000000000001",
      category: { id: "cat-02", name: "Equipamiento" },
      location: { id: "loc-02", name: "Sin Casillero / Sin ubicación fija" },
      code: "EQ-CITT-015",
      name: "Osciloscopio Digital Rigol",
      status: "EN_MANTENCION"
    }
  ],
  total: 2
};

// 2. Contrato de Préstamos y Movimientos
export const mockLoans = {
  data: [
    {
      id: "33333333-4444-5555-6666-777777777777",
      item: { id: "item-01", code: "TA-CITT-005", name: "Taladro Inalámbrico" },
      user: { id: "user-01", name: "Diego Morales", role: "USUARIO_GLOBAL" },
      school_origin: "Informática",
      type: "PRESTAMO",
      due_date: "2026-10-15T18:00:00Z",
      is_returned: false,
      approved_by: "Paz Constanza Morales Saavedra",
      created_at: "2026-10-08T10:00:00Z"
    },
    {
      id: "44444444-5555-6666-7777-888888888888",
      item: { id: "item-02", code: "3D-CITT-010", name: "Resina SLA" },
      user: { id: "user-02", name: "Camila Rojas", role: "USUARIO_GLOBAL" },
      school_origin: "Mecánica",
      type: "PEDIDO",
      due_date: null,
      is_returned: false,
      approved_by: "Alumno Líder - Turno Mañana",
      created_at: "2026-10-08T11:30:00Z"
    }
  ]
};

// 3. Contrato de Trazabilidad y Consumibles
export const mockStockMovements = {
  data: [
    {
      id: "55555555-6666-7777-8888-999999999999",
      item_id: "item-03",
      user_id: "user-03",
      movement_description: "Descuento por impresión de pieza 3D para alumno de Informática (Auto-convertido de gramos a Kg)",
      quantity_deducted: 0.05,
      unit: "kg",
      created_at: "2026-10-08T12:00:00Z"
    }
  ]
};

// 4. Contrato de Control de Accesos y Usuarios
export const mockUsers = {
  data: [
    {
      id: "admin-001",
      name: "Paz Constanza Morales Saavedra",
      email: "pc.morales@profesor.duoc.cl",
      role: "ADMINISTRADOR",
      is_blocked: false
    },
    {
      id: "al-001",
      name: "Juan Pérez",
      email: "ju.perez@duocuc.cl",
      role: "ALUMNO_LIDER",
      is_blocked: false
    },
    {
      id: "user-105",
      name: "Esteban Quito",
      email: "es.quito@duocuc.cl",
      role: "USUARIO_GLOBAL",
      is_blocked: true
    }
  ]
};

// 5. Contrato de Categorías
export const mockCategories = {
  data: [
    { id: "cat-01", name: "Impresión 3D" },
    { id: "cat-02", name: "Mobiliario" },
    { id: "cat-03", name: "Talleres" },
    { id: "cat-04", name: "Equipamiento" }
  ]
};

// 6. Contrato de Ubicaciones / Casilleros
export const mockLocations = {
  data: [
    { id: "loc-01", name: "Casillero A1" },
    { id: "loc-02", name: "Estante B2 (Laboratorio)" },
    { id: "loc-03", name: "Sin Casillero / Sin ubicación fija" }
  ]
};

// 7. Contrato de Roles y Permisos
export const mockRoles = {
  data: [
    {
      id: "role-admin",
      name: "ADMINISTRADOR",
      permissions: { can_manage_users: true, can_delete_assets: true }
    },
    {
      id: "role-al",
      name: "ALUMNO_LIDER",
      permissions: { can_manage_users: false, can_delete_assets: false }
    },
    {
      id: "role-global",
      name: "USUARIO_GLOBAL",
      permissions: { can_manage_users: false, can_delete_assets: false }
    }
  ]
};

// 8. Contrato de Parametrización Sede
export const mockTenants = {
  data: {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Duoc UC Sede San Bernardo",
    settings: {
      max_loan_days: 3,
      strict_digital_signature: true,
      critical_stock_alert: 5
    }
  }
};