# Feature 02 - Category System

**Estado**: ✅ Completado
**Prioridad**: Alta
**Complejidad**: Baja
**Tiempo Estimado**: 1-2 días
**Tiempo Real**: 1 hora

---

## Objetivo

Sistema de categorías predefinidas y personalizadas para clasificar transacciones de ingresos y gastos.

---

## User Stories

1. Como usuario, quiero ver una lista de categorías predefinidas
2. Como usuario, quiero crear mis propias categorías personalizadas
3. Como usuario, quiero editar y eliminar mis categorías
4. Como usuario, quiero asignar un color e icono a cada categoría
5. Como usuario, quiero filtrar transacciones por categoría

---

## Especificación Técnica

### Backend

#### Entity: Category

```csharp
public class Category
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; } // Null = system category
    public string Name { get; set; }
    public string Description { get; set; }
    public CategoryType Type { get; set; } // Income, Expense, Both
    public string Icon { get; set; } // Emoji or icon name
    public string Color { get; set; } // Hex color code
    public bool IsSystemDefined { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public User User { get; set; }
    public ICollection<Transaction> Transactions { get; set; }
}

public enum CategoryType
{
    Expense = 0,
    Income = 1,
    Both = 2
}
```

#### Controller: CategoriesController

**Endpoints**:
- `GET /api/categories` - Listar todas las categorías (system + user)
- `GET /api/categories/{id}` - Obtener detalle de categoría
- `POST /api/categories` - Crear nueva categoría personal
- `PUT /api/categories/{id}` - Actualizar categoría personal
- `DELETE /api/categories/{id}` - Eliminar categoría personal

#### DTOs

**CategoryRequest**:
```json
{
  "name": "Restaurantes",
  "description": "Comidas fuera de casa",
  "type": "Expense",
  "icon": "🍽️",
  "color": "#ef4444"
}
```

**CategoryResponse**:
```json
{
  "id": "uuid",
  "name": "Restaurantes",
  "description": "Comidas fuera de casa",
  "type": "Expense",
  "icon": "🍽️",
  "color": "#ef4444",
  "isSystemDefined": false,
  "transactionCount": 15,
  "totalAmount": 12500.00,
  "createdAt": "2025-01-15T10:30:00Z"
}
```

#### Categorías Predefinidas (System)

**Expenses** (10 categorías):
1. 🍔 **Alimentación** - Supermercado, comida diaria (#10b981)
2. 🚗 **Transporte** - Gasolina, Uber, transporte público (#3b82f6)
3. 🏠 **Vivienda** - Alquiler, mantenimiento, servicios (#8b5cf6)
4. ⚡ **Servicios** - Luz, agua, internet, teléfono (#f59e0b)
5. 💊 **Salud** - Médicos, farmacias, seguro (#ef4444)
6. 🎓 **Educación** - Cursos, libros, matricula (#06b6d4)
7. 🎮 **Entretenimiento** - Netflix, cine, hobbies (#ec4899)
8. 👕 **Ropa** - Vestuario y accesorios (#6366f1)
9. 🎁 **Regalos** - Regalos y donaciones (#14b8a6)
10. 📱 **Otros** - Gastos varios (#6b7280)

**Income** (3 categorías):
1. 💰 **Salario** - Sueldo mensual (#10b981)
2. 💼 **Freelance** - Ingresos por trabajos independientes (#3b82f6)
3. 🏦 **Inversiones** - Dividendos, intereses (#8b5cf6)

#### Seeder: CategorySeeder

```csharp
public class CategorySeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Categories.AnyAsync()) return;

        var systemUserId = Guid.Parse("b47b33b5-11d0-4d55-a012-be51caa42a6f");

        var categories = new List<Category>
        {
            // Expenses
            new() { Name = "Alimentación", Type = CategoryType.Expense, Icon = "🍔", Color = "#10b981", IsSystemDefined = true },
            new() { Name = "Transporte", Type = CategoryType.Expense, Icon = "🚗", Color = "#3b82f6", IsSystemDefined = true },
            // ... más categorías
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
    }
}
```

### Frontend

#### Page: Categories.jsx

**Features**:
- Grid de categorías con iconos y colores
- Separación visual: System vs Personal
- Botones: Create, Edit, Delete (solo personal)
- Estadísticas: número de transacciones, total gastado

#### Component: CategoryModal.jsx

**Fields**:
- Name (text input)
- Description (textarea, optional)
- Type selector (Expense/Income/Both)
- Icon picker (emoji selector)
- Color picker (hex color input)

#### Component: CategoryCard.jsx

```jsx
<div className="category-card" style={{ borderColor: category.color }}>
  <span className="text-4xl">{category.icon}</span>
  <h3>{category.name}</h3>
  <p className="text-sm text-gray-500">{category.transactionCount} transactions</p>
  <p className="font-bold">{formatCurrency(category.totalAmount)}</p>
  {!category.isSystemDefined && (
    <div className="actions">
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  )}
</div>
```

---

## Reglas de Negocio

1. **System Categories**: No pueden ser editadas ni eliminadas por usuarios
2. **Unique Names**: Nombres de categorías deben ser únicos por usuario
3. **Deletion Protection**: No se puede eliminar categoría si tiene transacciones asociadas
4. **Soft Delete**: Categorías eliminadas se marcan como `IsActive = false`
5. **Type Consistency**: Categoría Expense solo se puede asignar a transacciones Expense

---

## Validaciones

```csharp
public class CategoryRequestValidator : AbstractValidator<CategoryRequest>
{
    public CategoryRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Description)
            .MaximumLength(200);

        RuleFor(x => x.Color)
            .NotEmpty()
            .Matches("^#([A-Fa-f0-9]{6})$")
            .WithMessage("Color must be a valid hex code (e.g., #3b82f6)");

        RuleFor(x => x.Icon)
            .NotEmpty()
            .MaximumLength(10);
    }
}
```

---

## API Examples

### GET /api/categories

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Alimentación",
      "type": "Expense",
      "icon": "🍔",
      "color": "#10b981",
      "isSystemDefined": true,
      "transactionCount": 45,
      "totalAmount": 35000.00
    },
    {
      "id": "uuid-2",
      "name": "Restaurantes",
      "type": "Expense",
      "icon": "🍽️",
      "color": "#ef4444",
      "isSystemDefined": false,
      "transactionCount": 12,
      "totalAmount": 8500.00
    }
  ]
}
```

### POST /api/categories

**Request**:
```json
{
  "name": "Mascotas",
  "description": "Gastos de mi perro",
  "type": "Expense",
  "icon": "🐕",
  "color": "#f59e0b"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-new",
    "name": "Mascotas",
    "description": "Gastos de mi perro",
    "type": "Expense",
    "icon": "🐕",
    "color": "#f59e0b",
    "isSystemDefined": false,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### DELETE /api/categories/{id}

**Error si tiene transacciones**:
```json
{
  "success": false,
  "error": "Cannot delete category with existing transactions. Found 12 transactions using this category.",
  "statusCode": 400
}
```

---

## Testing

### Unit Tests

```csharp
[Fact]
public async Task CreateCategory_SystemUser_ReturnsForbidden()
{
    // System categories should not be creatable by users
    var request = new CategoryRequest { Name = "System Cat" };

    await Assert.ThrowsAsync<ForbiddenException>(() =>
        _controller.Create(request));
}

[Fact]
public async Task DeleteCategory_WithTransactions_ThrowsException()
{
    // Arrange
    var categoryId = Guid.NewGuid();
    // Create category with transactions

    // Act & Assert
    await Assert.ThrowsAsync<BusinessException>(() =>
        _controller.Delete(categoryId));
}
```

---

## Performance Optimizations

1. **Caching**: Categories raramente cambian, cache por 5 minutos
2. **Statistics**: Pre-calcular transactionCount y totalAmount
3. **Indexing**: Índice en UserId y IsActive

---

## Archivos Creados/Modificados

### Backend (5 archivos)
- `FinanceManager.Core/Entities/Category.cs`
- `FinanceManager.Core/Interfaces/Repositories/ICategoryRepository.cs`
- `FinanceManager.Infrastructure/Repositories/CategoryRepository.cs`
- `FinanceManager.API/Controllers/CategoriesController.cs`
- `FinanceManager.Infrastructure/Seeders/CategorySeeder.cs`

### Frontend (3 archivos)
- `src/pages/Categories.jsx`
- `src/components/CategoryModal.jsx`
- `src/components/CategoryCard.jsx`

---

## UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  Categories                                      [+ New]     │
├─────────────────────────────────────────────────────────────┤
│  System Categories                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │   🍔    │ │   🚗    │ │   🏠    │ │   ⚡    │          │
│  │Alimenta │ │Transport│ │Vivienda │ │Servicios│          │
│  │45 trans │ │23 trans │ │12 trans │ │18 trans │          │
│  │RD$35,000│ │RD$8,500 │ │RD$25,000│ │RD$6,200 │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│  My Categories                                              │
│  ┌─────────┐ ┌─────────┐                                  │
│  │   🍽️    │ │   🐕    │                                  │
│  │Restaura │ │Mascotas │                                  │
│  │12 trans │ │8 trans  │                                  │
│  │RD$8,500 │ │RD$2,100 │                                  │
│  │[Edit][x]│ │[Edit][x]│                                  │
│  └─────────┘ └─────────┘                                  │
└─────────────────────────────────────────────────────────────┘
```

---

**Última Actualización**: 2025-10-10
**Estado**: Feature completada y validada
**Dependencias**: Ninguna
**Usado por**: Feature 01 (Transactions), Feature 05 (Budgets)
