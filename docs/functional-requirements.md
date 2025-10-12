### 1.1 Gestión de Transacciones

**RF-001: Registro Manual de Transacciones**
- Agregar ingresos/egresos con: fecha, monto, moneda (DOP/USD/EUR), categoría, subcategoría, descripción, método de pago, entidad financiera
- Editar y eliminar transacciones existentes
- Soporte para transacciones recurrentes (suscripciones, nómina, etc.)
- Adjuntar comprobantes/notas a cada transacción

**RF-002: Captura de Facturas por OCR**
- Subir foto de factura/recibo
- Extraer automáticamente: fecha, monto total, comercio, items individuales
- Permitir revisión/corrección antes de confirmar
- Vincular automáticamente a categorías sugeridas

**RF-003: Detalle de Transacciones**
- Desglosar egresos en items individuales (especialmente supermercados, farmacias, restaurantes)
- Asignar categorías específicas a cada item
- Visualizar items más comprados y frecuencia

**RF-004: Importación de Estados de Cuenta**
- Importar archivos CSV/Excel de bancos
- Mapeo automático a transacciones existentes (evitar duplicados)
- Reconciliación inteligente basada en fecha, monto y descripción
- Sugerencia de categorización basada en histórico

### 1.2 Categorización y Organización

**RF-005: Sistema de Categorías**
- Categorías predefinidas: Vivienda, Alimentación, Transporte, Salud, Entretenimiento, Educación, Servicios, Inversiones, etc.
- Subcategorías personalizables
- Etiquetas adicionales para mejor organización
- Reglas automáticas de categorización

**RF-006: Gestión de Entidades Financieras**
- Registrar bancos, tarjetas de crédito, efectivo, billeteras digitales
- Balance actual de cada cuenta
- Historial de movimientos por entidad

### 1.3 Presupuestos

**RF-007: Creación de Presupuestos**
- Definir presupuesto mensual por categoría
- Presupuestos anuales con distribución mensual
- Alertas al alcanzar 80% y 100% del presupuesto
- Comparación presupuestado vs. real

**RF-008: Presupuesto Dinámico**
- Ajuste automático basado en patrones históricos
- Sugerencias de optimización
- Reasignación de presupuesto no utilizado

### 1.4 Módulo de Ahorros y Metas

**RF-009: Gestión de Metas de Ahorro**
- Crear metas con: nombre, monto objetivo, fecha límite, prioridad
- Asignar ahorros a metas específicas
- Tracking visual del progreso (%)
- Proyección de cumplimiento basada en ahorro promedio
- Calculadora: "¿cuánto debo ahorrar mensualmente para lograr X?"

**RF-010: Fondos de Emergencia**
- Definir fondo de emergencia objetivo (3-6 meses de gastos)
- Separar del ahorro para metas específicas
- Alertas si se utiliza el fondo

### 1.5 Multi-moneda

**RF-011: Soporte Multi-moneda**
- Cada transacción en su moneda original (DOP/USD/EUR)
- Tasas de cambio: manual o automática (API - a definir)
- Histórico de tasas de cambio
- Conversión en tiempo real para reportes consolidados
- Selección de "moneda base" para visualización unificada

### 1.6 Dashboard e Informes

**RF-012: Dashboard Principal**
- Balance total (todas las cuentas)
- Ingresos vs. Egresos del mes actual
- Gráfico de tendencias (últimos 6-12 meses)
- Top categorías de gasto
- Transacciones recientes
- Progreso de metas de ahorro
- Estado de presupuestos

**RF-013: Reportes Analíticos**
- Comparación mes a mes, año a año
- Distribución de gastos por categoría (pie chart)
- Evolución temporal (line/bar charts)
- Análisis de cashflow
- Identificación de gastos hormiga
- Proyecciones financieras

**RF-014: Exportación de Datos**
- Exportar a CSV/Excel por: período, categoría, entidad, moneda
- Filtros avanzados para exportación personalizada
- Plantillas de reporte predefinidas

### 1.7 Características Adicionales (Valor Agregado)

**RF-015: Recordatorios y Alertas**
- Pagos pendientes
- Vencimientos de tarjetas de crédito
- Gastos inusuales detectados
- Bajo balance en cuentas

**RF-016: Análisis con ML (Ollama)**
- Detección de patrones de gasto
- Predicción de gastos futuros
- Identificación de oportunidades de ahorro
- Categorización inteligente de transacciones
- Chatbot para consultas: "¿Cuánto gasté en restaurantes el mes pasado?"
- OCR para extracción de datos de facturas (tecnología a definir)

**RF-017: Planificación Fiscal**
- Cálculo estimado de impuestos (si aplica)
- Tracking de gastos deducibles
- Resumen anual para declaración
