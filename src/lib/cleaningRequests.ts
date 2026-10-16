 export type SmartBin = {
  id: string;
  name: string;
  location: string;
  fillLevel: number;
  routeId?: string;
};

export type CleaningRequest = {
  id: string;
  binId: string;
  binName: string;
  location: string;
  fillLevel: number;
  routeId?: string;
  status: "Pending" | "Completed";
  createdAt: string;
  collectedAt?: string;
  dumpingLocation?: string;
  dumpedKg?: number;
};

export const CLEANING_THRESHOLD = 60;

export function getBinsNeedingCleaning(bins: SmartBin[]) {
  return bins.filter(
    (bin) => bin.fillLevel >= CLEANING_THRESHOLD,
  );
}

export function createCleaningRequest(
  bin: SmartBin,
): CleaningRequest {
  return {
    id: `CR-${Date.now()}-${bin.id}`,
    binId: bin.id,
    binName: bin.name,
    location: bin.location,
    fillLevel: bin.fillLevel,
    routeId: bin.routeId,
    status: "Pending",
    createdAt: new Date().toLocaleString(),
  };
}

export function recordCollection(
  request: CleaningRequest,
  dumpingLocation: string,
  dumpedKg: number,
): CleaningRequest {
  return {
    ...request,
    status: "Completed",
    collectedAt: new Date().toLocaleString(),
    dumpingLocation,
    dumpedKg,
  };
}