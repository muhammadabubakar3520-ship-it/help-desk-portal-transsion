import { api } from './api'

// Admin-only data export. Hits a PDF-returning endpoint (not JSON), so it
// goes through api.download() rather than api.get().
export const reportService = {
  downloadAdminReport() {
    return api.download('/admin/export.pdf', 'helpdesk-report.pdf')
  }
}
