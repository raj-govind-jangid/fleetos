import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import * as documentService from '../../services/document.service';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge, statusBadgeVariant } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Select } from '../../components/common/Select';
import { DOCUMENT_STATUSES, DOCUMENT_TYPES } from '../../types/operations';
import { formatDate } from '../../utils/formatDate';

function vehicleLabel(vehicleId: unknown): string {
  if (!vehicleId) return '—';
  if (typeof vehicleId === 'object' && vehicleId !== null && 'registrationNumber' in vehicleId) {
    return String((vehicleId as { registrationNumber: string }).registrationNumber);
  }
  return String(vehicleId);
}

export default function DocumentList() {
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      status: status || undefined,
      documentType: documentType || undefined,
    }),
    [page, status, documentType]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentService.listDocuments(params),
  });

  const deleteMutation = useMutation({
    mutationFn: documentService.deleteDocument,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['documents'] }),
  });

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Document deleted');
      setDeleteId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Vehicle compliance documents"
        actions={
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/documents/new')}
          >
            Add Document
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
        <Select
          options={DOCUMENT_TYPES.map((t) => ({ label: t, value: t }))}
          placeholder="All types"
          value={documentType}
          onChange={(e) => {
            setDocumentType(e.target.value);
            setPage(1);
          }}
          className="sm:w-44 sm:shrink-0"
        />
        <Select
          options={DOCUMENT_STATUSES.map((s) => ({ label: s, value: s }))}
          placeholder="All statuses"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="sm:w-44 sm:shrink-0"
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.data.length ? (
        <EmptyState
          title="No documents found"
          actionLabel="Add Document"
          onAction={() => navigate('/documents/new')}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Vehicle</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Number</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Issue</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Expiry</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-700">{vehicleLabel(doc.vehicleId)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{doc.documentType}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{doc.documentNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(doc.issueDate)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(doc.expiryDate)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(doc.status)}>{doc.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(doc._id)}
                        leftIcon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        message="Delete this document?"
        loading={deleteMutation.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
