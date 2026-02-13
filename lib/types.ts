// Shared types for the AeroSky mobile app
// These are copied from the web app and can be reused directly

export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    organizationId?: string;
    organizationName?: string;
}

export interface TeamMember {
    id: string;
    accessId: string;
    name: string;
    phone: string;
    email: string;
    position: string;
    createdAt: string;
}

export interface Subcontractor {
    id: string;
    companyName: string;
    type: 'Design' | 'Manufacturing';
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    agreementDate: string;
    createdAt: string;
}

export interface DroneUpload {
    trainingManual?: string;
    infrastructureManufacturing: string[];
    infrastructureTesting: string[];
    infrastructureOffice: string[];
    infrastructureOthers: { label: string; image: string }[];
    regulatoryDisplay: string[];
    systemDesign?: string;
    hardwareSecurity: string[];
    webPortalLink?: string;
}

export interface ManufacturedUnit {
    serialNumber: string;
    uin: string;
}

export interface Battery {
    id: string;
    model: string;
    ratedCapacity: string;
    batteryNumberA: string;
    batteryNumberB: string;
    createdAt: string;
}

export interface Order {
    id: string;
    contractNumber: string;
    clientName: string;
    clientSegment: string;
    orderDate: string;
    estimatedCompletionDate?: string;
    contractValue: number;
    currency: string;
    revenueRecognitionStatus: string;
    droneModel: string;
    droneType: string;
    weightClass: string;
    payloadConfiguration?: string;
    flightEnduranceRequirements?: string;
    softwareAiTier?: string;
    dgcaFaaCertificationStatus: string;
    uin?: string;
    exportLicenseStatus?: string;
    geofencingRequirements?: string;
    bomReadiness: string;
    manufacturingStage: string;
    calibrationTestLogs?: string;
    afterSalesAmc?: string;
    cocData?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Drone {
    id: string;
    modelName: string;
    image?: string;
    accountableManagerId?: string;
    uploads: DroneUpload;
    manufacturedUnits: ManufacturedUnit[];
    createdAt: string;
}

export interface FlightLog {
    id: string;
    organizationId?: string;
    date: string;
    takeoffTime: string;
    duration: string;
    locationCoords?: string;
    locationName?: string;
    picId?: string;
    voId?: string;
    missionType: string;
    droneId: string;
    serialNumber?: string;
    uin?: string;
    technicalFeedback?: string;
    batteryId?: string;
    createdAt: string;
    updatedAt: string;
    drone?: Drone;
    pic?: TeamMember;
    vo?: TeamMember;
    battery?: Battery;
}

export interface FlightPlan {
    id: string;
    drone_id: string;
    pilot_id: string;
    status: string;
    planned_start: string;
    planned_end: string;
    takeoff_lat: number;
    takeoff_lon: number;
    flight_purpose: string;
}

export interface Pilot {
    id: string;
    full_name: string;
    rpto_authorization_number: string;
    category_rating: string;
    status: string;
}

export interface InventoryComponent {
    id: string;
    name: string;
    description: string | null;
    quantity: number;
}

export interface InventoryTransaction {
    id: string;
    componentId: string;
    type: 'IN' | 'OUT';
    quantity: number;
    date: string;
    subcontractorId?: string;
    userId?: string;
    takenOutFor?: string;
    component: InventoryComponent;
    subcontractor?: Subcontractor;
    user?: { fullName: string; username: string };
}
