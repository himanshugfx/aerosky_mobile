import * as React from 'react';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../constants/Colors';
import * as DocumentPicker from 'expo-document-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { Order } from '../lib/types';

interface AddOrderModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (order: Partial<Order>) => Promise<void>;
    initialData?: Order | null;
}

const CLIENT_SEGMENTS = ["Defense", "Agriculture", "Logistics", "Infrastructure", "Other"];
const DRONE_TYPES = ["Fixed-wing", "Multirotor", "Hybrid VTOL"];
const WEIGHT_CLASSES = ["Nano", "Micro", "Small", "Medium"];
const PAYLOAD_CONFIGS = ["LiDAR", "Thermal IR", "RGB Camera", "Sprayer", "Multi-Sensor", "None"];
const SOFTWARE_TIERS = ["Basic", "Autonomy Level 4", "Swarm Capability", "Data Analytics", "Enterprise"];
const REVENUE_STATUSES = ["Pending", "Partially Billed", "Fully Billed", "Earned"];
const CERTIFICATION_STATUSES = ["Pending", "In Progress", "Approved", "N/A"];
const EXPORT_LICENSE_STATUSES = ["Not Required", "Pending", "Approved", "Rejected"];
const BOM_READINESS_OPTIONS = ["Not Ready", "Partial", "Ready"];
const MANUFACTURING_STAGES = ["In Design", "Assembly", "Quality Testing", "Flight Calibration", "Ready"];

export default function AddOrderModal({ visible, onClose, onSubmit, initialData }: AddOrderModalProps) {
    const [contractNumber, setContractNumber] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientSegment, setClientSegment] = useState(CLIENT_SEGMENTS[0]);
    const [droneModel, setDroneModel] = useState('');
    const [droneType, setDroneType] = useState(DRONE_TYPES[0]);
    const [weightClass, setWeightClass] = useState(WEIGHT_CLASSES[0]);
    const [payloadConfiguration, setPayloadConfiguration] = useState(PAYLOAD_CONFIGS[0]);
    const [flightEnduranceRequirements, setFlightEnduranceRequirements] = useState('');
    const [softwareAiTier, setSoftwareAiTier] = useState(SOFTWARE_TIERS[0]);
    const [contractValue, setContractValue] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [orderDate, setOrderDate] = useState('');
    const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('');
    const [revenueRecognitionStatus, setRevenueRecognitionStatus] = useState(REVENUE_STATUSES[0]);
    const [manufacturingStage, setManufacturingStage] = useState(MANUFACTURING_STAGES[0]);
    const [dgcaFaaCertificationStatus, setDgcaFaaCertificationStatus] = useState(CERTIFICATION_STATUSES[0]);
    const [uin, setUin] = useState('');
    const [exportLicenseStatus, setExportLicenseStatus] = useState(EXPORT_LICENSE_STATUSES[0]);
    const [geofencingRequirements, setGeofencingRequirements] = useState('');
    const [bomReadiness, setBomReadiness] = useState(BOM_READINESS_OPTIONS[0]);
    const [afterSalesAmc, setAfterSalesAmc] = useState('');
    const [manufacturingNotes, setManufacturingNotes] = useState('');
    const [calibrationTestLogs, setCalibrationTestLogs] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unitPrice, setUnitPrice] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('Unpaid');
    const [priorityLevel, setPriorityLevel] = useState('Normal');
    const [qualityCheckStatus, setQualityCheckStatus] = useState('Pending');
    const [warrantyTerms, setWarrantyTerms] = useState('');
    const [specialRequirements, setSpecialRequirements] = useState('');
    const [internalOrderNotes, setInternalOrderNotes] = useState('');
    const [uploads, setUploads] = useState<{ fileData: string, fileName: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    useEffect(() => {
        if (visible) {
            setContractNumber(initialData?.contractNumber || '');
            setClientName(initialData?.clientName || '');
            setClientSegment(initialData?.clientSegment || CLIENT_SEGMENTS[0]);
            setDroneModel(initialData?.droneModel || '');
            setDroneType(initialData?.droneType || DRONE_TYPES[0]);
            setWeightClass(initialData?.weightClass || WEIGHT_CLASSES[0]);
            setPayloadConfiguration(initialData?.payloadConfiguration || PAYLOAD_CONFIGS[0]);
            setFlightEnduranceRequirements(initialData?.flightEnduranceRequirements || '');
            setSoftwareAiTier(initialData?.softwareAiTier || SOFTWARE_TIERS[0]);
            setContractValue(initialData?.contractValue?.toString() || '');
            setCurrency(initialData?.currency || 'INR');
            setOrderDate(initialData?.orderDate ? initialData.orderDate.split('T')[0] : new Date().toISOString().split('T')[0]);
            setEstimatedCompletionDate(initialData?.estimatedCompletionDate ? initialData.estimatedCompletionDate.split('T')[0] : '');
            setRevenueRecognitionStatus(initialData?.revenueRecognitionStatus || REVENUE_STATUSES[0]);
            setManufacturingStage(initialData?.manufacturingStage || MANUFACTURING_STAGES[0]);
            setDgcaFaaCertificationStatus(initialData?.dgcaFaaCertificationStatus || CERTIFICATION_STATUSES[0]);
            setUin(initialData?.uin || '');
            setExportLicenseStatus(initialData?.exportLicenseStatus || EXPORT_LICENSE_STATUSES[0]);
            setGeofencingRequirements(initialData?.geofencingRequirements || '');
            setBomReadiness(initialData?.bomReadiness || BOM_READINESS_OPTIONS[0]);
            setAfterSalesAmc(initialData?.afterSalesAmc || '');
            setManufacturingNotes(initialData?.manufacturingNotes || '');
            setCalibrationTestLogs(initialData?.calibrationTestLogs || '');
            setContactPerson(initialData?.contactPerson || '');
            setContactPhone(initialData?.contactPhone || '');
            setContactEmail(initialData?.contactEmail || '');
            setDeliveryAddress(initialData?.deliveryAddress || '');
            setQuantity(initialData?.quantity?.toString() || '1');
            setUnitPrice(initialData?.unitPrice?.toString() || '');
            setPaymentTerms(initialData?.paymentTerms || '');
            setPaymentStatus(initialData?.paymentStatus || 'Unpaid');
            setPriorityLevel(initialData?.priorityLevel || 'Normal');
            setQualityCheckStatus(initialData?.qualityCheckStatus || 'Pending');
            setWarrantyTerms(initialData?.warrantyTerms || '');
            setSpecialRequirements(initialData?.specialRequirements || '');
            setInternalOrderNotes(initialData?.internalOrderNotes || '');
            setUploads([]);
        }
    }, [visible, initialData]);

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                const newDoc = {
                    fileData: 'PLACEHOLDER_BASE64', // In a real app we'd convert it
                    fileName: result.assets[0].name
                };
                setUploads(prev => [...prev, newDoc]);
            }
        } catch (err) {
            console.error('Picker error:', err);
        }
    };

    const handleSubmit = async () => {
        if (!contractNumber.trim() || !clientName.trim() || !droneModel.trim()) {
            Alert.alert('Required Fields', 'Please fill in all fields marked with *');
            return;
        }

        setIsLoading(true);
        try {
            const dateObj = new Date(orderDate);
            if (isNaN(dateObj.getTime())) {
                Alert.alert('Invalid Date', 'Please enter a valid date (YYYY-MM-DD)');
                setIsLoading(false);
                return;
            }

            await onSubmit({
                contractNumber: contractNumber.trim(),
                clientName: clientName.trim(),
                clientSegment,
                droneModel: droneModel.trim(),
                droneType,
                weightClass,
                payloadConfiguration,
                flightEnduranceRequirements,
                softwareAiTier,
                contractValue: parseFloat(contractValue) || 0,
                currency,
                orderDate: dateObj.toISOString(),
                estimatedCompletionDate: estimatedCompletionDate ? new Date(estimatedCompletionDate).toISOString() : undefined,
                revenueRecognitionStatus,
                manufacturingStage,
                dgcaFaaCertificationStatus,
                uin,
                exportLicenseStatus,
                geofencingRequirements,
                bomReadiness,
                afterSalesAmc,
                manufacturingNotes,
                calibrationTestLogs,
                contactPerson,
                contactPhone,
                contactEmail,
                deliveryAddress,
                quantity: quantity ? parseInt(quantity) : 1,
                unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
                paymentTerms,
                paymentStatus,
                priorityLevel,
                qualityCheckStatus,
                warrantyTerms,
                specialRequirements,
                internalOrderNotes,
                // uploads handled via specific logic if needed
            });
            Alert.alert('Success', initialData ? 'Order updated' : 'Order created');
            onClose();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to save order.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderPicker = (label: string, value: string, options: string[], setter: (val: string) => void) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt}
                        style={[
                            styles.optionButton,
                            { borderColor: theme.border, backgroundColor: theme.cardBackground },
                            value === opt && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setter(opt)}
                    >
                        <Text style={[
                            styles.optionText,
                            { color: theme.textSecondary },
                            value === opt && { color: '#fff' }
                        ]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
            >
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.title, { color: theme.text }]}>{initialData ? 'Edit Order' : 'New Order'}</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Enter manufacturing details below</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardBackground }]}>
                            <FontAwesome name="times" size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        {/* Section 1: Core Info */}
                        <Text style={styles.sectionHeader}>Contract & Financials</Text>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Contract Number *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={contractNumber}
                                onChangeText={setContractNumber}
                                placeholder="e.g. ORD-2026-001"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Client Name *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={clientName}
                                onChangeText={setClientName}
                                placeholder="Enter client name"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        {renderPicker('Client Segment', clientSegment, CLIENT_SEGMENTS, setClientSegment)}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>POC Name</Text>
                            <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]} value={contactPerson} onChangeText={setContactPerson} placeholder="Contact person name" placeholderTextColor={theme.textSecondary + '60'} />
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>POC Phone</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]} value={contactPhone} onChangeText={setContactPhone} placeholder="Phone #" placeholderTextColor={theme.textSecondary + '60'} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>POC Email</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]} value={contactEmail} onChangeText={setContactEmail} placeholder="Email" placeholderTextColor={theme.textSecondary + '60'} keyboardType="email-address" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Delivery Address</Text>
                            <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border, height: 80 }]} value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="Full address" placeholderTextColor={theme.textSecondary + '60'} multiline />
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Quantity</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]} value={quantity} onChangeText={setQuantity} placeholder="1" keyboardType="numeric" placeholderTextColor={theme.textSecondary + '60'} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Unit Price (₹)</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]} value={unitPrice} onChangeText={setUnitPrice} placeholder="0" keyboardType="numeric" placeholderTextColor={theme.textSecondary + '60'} />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Payment Terms</Text>
                            <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]} value={paymentTerms} onChangeText={setPaymentTerms} placeholder="e.g. 50% Advance" placeholderTextColor={theme.textSecondary + '60'} />
                        </View>

                        {renderPicker('Payment Status', paymentStatus, ['Unpaid', 'Partial', 'Paid'], setPaymentStatus)}

                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Order Date</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={orderDate}
                                    onChangeText={setOrderDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Est. Completion</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={estimatedCompletionDate}
                                    onChangeText={setEstimatedCompletionDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { width: 80 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Currency</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={currency}
                                    onChangeText={setCurrency}
                                    placeholder="INR"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Contract Value</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={contractValue}
                                    onChangeText={setContractValue}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>
                        </View>

                        {renderPicker('Revenue Status', revenueRecognitionStatus, REVENUE_STATUSES, setRevenueRecognitionStatus)}

                        {/* Section 2: Technical */}
                        <Text style={styles.sectionHeader}>Drone Configuration</Text>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Drone Model *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={droneModel}
                                onChangeText={setDroneModel}
                                placeholder="e.g. AeroSys Aviation X1"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        {renderPicker('Drone Type', droneType, DRONE_TYPES, setDroneType)}
                        {renderPicker('Weight Class', weightClass, WEIGHT_CLASSES, setWeightClass)}
                        {renderPicker('Payload', payloadConfiguration, PAYLOAD_CONFIGS, setPayloadConfiguration)}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Endurance Requirements</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={flightEnduranceRequirements}
                                onChangeText={setFlightEnduranceRequirements}
                                placeholder="e.g. 45 minutes"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        {renderPicker('Software/AI Tier', softwareAiTier, SOFTWARE_TIERS, setSoftwareAiTier)}

                        {/* Section 3: Compliance */}
                        <Text style={styles.sectionHeader}>Regulatory Tracking</Text>
                        {renderPicker('Certification Status', dgcaFaaCertificationStatus, CERTIFICATION_STATUSES, setDgcaFaaCertificationStatus)}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>UIN</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={uin}
                                onChangeText={setUin}
                                placeholder="Government-issued ID"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        {renderPicker('Export License', exportLicenseStatus, EXPORT_LICENSE_STATUSES, setExportLicenseStatus)}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Geofencing Details</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={geofencingRequirements}
                                onChangeText={setGeofencingRequirements}
                                placeholder="Regional restrictions"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        {/* Section 4: Operational */}
                        <Text style={styles.sectionHeader}>Operational Status</Text>
                        {renderPicker('Priority Level', priorityLevel, ['Low', 'Normal', 'High', 'Urgent'], setPriorityLevel)}
                        {renderPicker('Quality Check', qualityCheckStatus, ['Pending', 'Passed', 'Failed'], setQualityCheckStatus)}
                        {renderPicker('BOM Readiness', bomReadiness, BOM_READINESS_OPTIONS, setBomReadiness)}
                        {renderPicker('Manufacturing Stage', manufacturingStage, MANUFACTURING_STAGES, setManufacturingStage)}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>After-Sales/AMC</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={afterSalesAmc}
                                onChangeText={setAfterSalesAmc}
                                placeholder="Service details"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Manufacturing Notes</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border, height: 100 }]}
                                value={manufacturingNotes}
                                onChangeText={setManufacturingNotes}
                                placeholder="Details for manufacturing & payloads"
                                multiline
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Calibration Logs</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border, height: 80 }]}
                                value={calibrationTestLogs}
                                onChangeText={setCalibrationTestLogs}
                                placeholder="Flight test notes"
                                multiline
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Special Requirements</Text>
                            <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border, height: 80 }]} value={specialRequirements} onChangeText={setSpecialRequirements} placeholder="Custom client specs" multiline placeholderTextColor={theme.textSecondary + '60'} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Internal Team Notes</Text>
                            <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border, height: 80 }]} value={internalOrderNotes} onChangeText={setInternalOrderNotes} placeholder="Private notes" multiline placeholderTextColor={theme.textSecondary + '60'} />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: theme.primary, shadowColor: theme.primary },
                                (!contractNumber.trim() || !clientName.trim() || !droneModel.trim()) && { backgroundColor: theme.border }
                            ]}
                            onPress={handleSubmit}
                            disabled={isLoading || !contractNumber.trim() || !clientName.trim() || !droneModel.trim()}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {initialData ? 'Update Order' : 'Create Order'}
                                </Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Discard Changes</Text>
                        </TouchableOpacity>
                        <View style={{ height: 60 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: BorderRadius.xl * 1.5,
        borderTopRightRadius: BorderRadius.xl * 1.5,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        height: '92%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: FontSizes.sm,
        marginTop: 2,
        fontWeight: '500',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    form: {
        flex: 1,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '900',
        color: '#3b82f6',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
        opacity: 0.8
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    inputRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.sm,
    },
    label: {
        fontSize: 11,
        marginBottom: 6,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1.5,
        fontSize: 15,
        fontWeight: '500',
    },
    optionRow: {
        flexDirection: 'row',
        gap: 8,
        paddingRight: 20
    },
    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        borderWidth: 1.5,
    },
    optionText: {
        fontSize: 12,
        fontWeight: '700',
    },
    submitButton: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginTop: Spacing.lg,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cancelBtn: {
        padding: Spacing.lg,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelBtnText: {
        fontWeight: '700',
        fontSize: 14,
    },
});

