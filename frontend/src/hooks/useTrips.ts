import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tripService from '../services/trip.service';
import type { TripListParams } from '../services/trip.service';
import type { TripInput, TripUpdateInput } from '../types/trip';

export function useTrips(params: TripListParams = {}) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => tripService.listTrips(params),
  });
}

export function useTrip(id?: string) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: () => tripService.getTrip(id!),
    enabled: Boolean(id),
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TripInput) => tripService.createTrip(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trips'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TripUpdateInput }) =>
      tripService.updateTrip(id, payload),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['trips'] });
      void qc.invalidateQueries({ queryKey: ['trips', vars.id] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripService.deleteTrip(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trips'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
