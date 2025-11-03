# Feature 11 - OCR for Receipts & Invoices

**Estado**: ⏸️ Pendiente
**Prioridad**: Alta
**Complejidad**: Media
**Tiempo Estimado**: 2 semanas (8-10 días)
**ROI**: ALTO (reduce data entry 80%)

---

## Objetivo

Extracción automática de datos de facturas y recibos usando visión por computadora (Llama 3.2 Vision 11B).

---

## Casos de Uso

1. **Photo to Transaction**: Upload foto de factura → auto-crea transacción
2. **PDF Processing**: Procesar PDFs de recibos digitales
3. **Batch Upload**: Procesar múltiples facturas simultáneamente
4. **Cross-Validation**: Validar OCR con transacciones bancarias existentes

---

## Stack Técnico

**Model**: Llama 3.2 Vision 11B
- Best text extraction de imágenes
- Multilenguaje (español/inglés)
- RAM: ~8GB
- Inference: 3-5s per image

**Alternative**: LLaVA 1.6 13B (mejor para low-quality images)

**Processing Pipeline**:
```
Image Upload → Pre-processing (rotate, contrast)
    ↓
Llama Vision OCR
    ↓
JSON Extraction (merchant, amount, date, items)
    ↓
Confidence Scoring
    ↓
[>85%] Auto-create Transaction
[70-85%] Show for Review
[<70%] Manual Entry with Suggestions
```

---

## Extracted Fields

**Core Fields**:
- Merchant Name
- Transaction Date
- Total Amount
- Currency
- Tax Amount (if present)

**Optional Fields**:
- Items breakdown (description, quantity, price)
- Payment method
- Receipt/Invoice number
- Merchant address

---

## API Endpoints

- `POST /api/receipts/upload` - Upload image/PDF
- `GET /api/receipts/{id}` - Get extraction result
- `POST /api/receipts/{id}/verify` - Verify and correct extraction
- `POST /api/receipts/{id}/create-transaction` - Create transaction from receipt
- `DELETE /api/receipts/{id}` - Delete receipt and image

---

## Frontend

**Components**:
- `ReceiptUploader.jsx` - Drag-and-drop uploader
- `ReceiptPreview.jsx` - Image preview with extracted data overlay
- `ExtractionReview.jsx` - Manual correction interface
- `CreateTransactionFromReceipt.jsx` - Transaction creation flow

---

## Performance Targets

- OCR Processing: <5s per image
- Extraction Accuracy: >90% for clear images
- Field Recognition: >85% for core fields
- Batch Processing: 10 images/minute

---

## Challenges & Solutions

**Challenge 1: Image Quality**
- Solution: Auto-rotation, contrast enhancement, noise reduction

**Challenge 2: Multiple Formats**
- Solution: Prompt engineering per receipt type (restaurant, grocery, gas, etc.)

**Challenge 3: Handwritten Text**
- Solution: Confidence scoring, fallback to manual entry

**Challenge 4: Multi-Language**
- Solution: Llama Vision supports ES/EN, detect language automatically

---

**Dependencies**: Ollama + Llama Vision model, MinIO for image storage
**Next Step**: Setup Ollama Vision, test with sample receipts
