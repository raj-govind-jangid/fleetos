import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as driverService from '../services/driver.service';
import type { DriverListParams } from '../services/driver.service';
import type { DriverInput } from '../types/driver';

export function useDrivers(params: DriverListParams = {}) {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: () => driverService.listDrivers(params),
  });
}

export function useDriver(id?: string) {
  return useQuery({
    queryKey: ['drivers', id],
    queryFn: () => driverService.getDriver(id!),
    enabled: Boolean(id),
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DriverInput) => driverService.createDriver(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DriverInput> }) =>
      driverService.updateDriver(id, payload),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['drivers'] });
      void qc.invalidateQueries({ queryKey: ['drivers', vars.id] });
    },
  });
}

export function useDeleteDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driverService.deleteDriver(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
