import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as vehicleService from '../services/vehicle.service';
import type { VehicleListParams } from '../services/vehicle.service';
import type { VehicleInput } from '../types/vehicle';

export function useVehicles(params: VehicleListParams = {}) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => vehicleService.listVehicles(params),
  });
}

export function useVehicle(id?: string) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehicleService.getVehicle(id!),
    enabled: Boolean(id),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VehicleInput) => vehicleService.createVehicle(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<VehicleInput> }) =>
      vehicleService.updateVehicle(id, payload),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['vehicles'] });
      void qc.invalidateQueries({ queryKey: ['vehicles', vars.id] });
    },
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehicleService.deleteVehicle(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useAssignDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, driverId }: { id: string; driverId: string | null }) =>
      vehicleService.assignDriver(id, driverId),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['vehicles'] });
      void qc.invalidateQueries({ queryKey: ['vehicles', vars.id] });
    },
  });
}
