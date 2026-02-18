import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import Colors, { BorderRadius, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';

// Accordion Component
const AccordionItem = ({
    title, description, icon, isComplete, children, status
}: {
    title: string;
    description: string;
    icon: string;
    isComplete: boolean;
    children: React.ReactNode;
    status?: { label: string; color: 'green' | 'yellow' | 'red' };
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const statusColor = status?.color === 'green' ? Colors.dark.success :
        status?.color === 'yellow' ? '#EAB308' :
            status?.color === 'red' ? Colors.dark.error :
                isComplete ? Colors.dark.success : '#EAB308';
    const statusLabel = status?.label || (isComplete ? 'Done' : 'Pending');

    return (
        <View style={styles.accordionContainer}>
            <TouchableOpacity
                style={[styles.accordionHeader, { borderLeftColor: statusColor, borderLeftWidth: 4 }]}
                onPress={() => setIsOpen(!isOpen)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconBox, { backgroundColor: statusColor + '20' }]}>
                    <FontAwesome name={icon as any} size={18} color={statusColor} />
                </View>
                <View style={styles.headerInfo}>
                    <View style={styles.titleRow}>
                        <Text style={styles.accordionTitle}>{title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '30' }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
                        </View>
                    </View>
                    <Text style={styles.accordionSubtitle}>{description}</Text>
                </View>
                <FontAwesome name={isOpen ? "chevron-up" : "chevron-down"} size={14} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
            {isOpen && <View style={styles.accordionContent}>{children}</View>}
        </View>
    );
};

export default function DroneDetailScreen() {
    const ids = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const {
        drones,
        teamMembers,
        subcontractors,
        fetchDrones,
        fetchTeamMembers,
        fetchSubcontractors,
        fetchBatteries,
        assignAccountableManager,
        updateWebPortal,
        updateManufacturedUnits,
        updateRecurringData
    } = useComplianceStore();

    // Derive drone data directly from store
    const droneData = drones.find(d => d.id === ids.id);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'ops' | 'compliance'>('info');
    const [webPortalLink, setWebPortalLink] = useState('');

    // Accordion states
    const [sections, setSections] = useState<Record<string, boolean>>({
        general: true,
        specs: false,
        pic: false,
        maintenance: false,
        docs: false,
    });



    // Recurring data states
    const [newStaffComp, setNewStaffComp] = useState({ date: '', staff: '', examiner: '', result: '' });
    const [newTraining, setNewTraining] = useState({ date: '', trainer: '', session: '', description: '', duration: '' });
    const [newEquipment, setNewEquipment] = useState({ date: '', equipment: '', serial: '', type: '', doneBy: '' });
    const [newBatterySafety, setNewBatterySafety] = useState({ date: '', testedItem: '', itemId: '', condition: '', testedBy: '' });
    const [newOperational, setNewOperational] = useState({ date: '', operation: '', uin: '', serialNumber: '', transferredTo: '' });
    const [newMaterial, setNewMaterial] = useState({ date: '', material: '', quantity: '', vendor: '' });
    const [newUasSold, setNewUasSold] = useState({ date: '', unitSerialNumber: '', soldTo: '' });
    const [newUnit, setNewUnit] = useState({ serialNumber: '', uin: '' });
    const [newPersonnel, setNewPersonnel] = useState({ date: '', position: '', previous: '', new: '' });
    const [recordType, setRecordType] = useState<'material' | 'uas'>('material');

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            await Promise.all([fetchDrones(), fetchTeamMembers(), fetchSubcontractors(), fetchBatteries()]);
            setIsLoading(false);
        };
        load();
    }, [ids.id]);

    useEffect(() => {
        if (droneData?.uploads?.webPortalLink) setWebPortalLink(droneData.uploads.webPortalLink);
    }, [droneData]);

    const addRecurring = async (key: string, data: any, reset: () => void) => {
        if (!droneData) return;
        const current = (droneData as any).recurringData?.[key] || [];
        await updateRecurringData(droneData.id, { [key]: [...current, data] });
        reset();
        Alert.alert('Success', 'Record added');
    };

    const deleteRecurring = async (key: string, index: number) => {
        if (!droneData) return;
        const current = (droneData as any).recurringData?.[key] || [];
        const updated = current.filter((_: any, i: number) => i !== index);
        await updateRecurringData(droneData.id, { [key]: updated });
    };

    if (isLoading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.dark.primary} /></View>;
    if (!droneData) return <View style={styles.errorContainer}><Text style={styles.errorText}>Drone not found</Text></View>;

    const drone = droneData; // Alias for cleaner usage below

    const uploads = drone.uploads || {};
    const recurring = (drone as any).recurringData || {};
    const checks = {
        orgManual: teamMembers.length > 0,
        trainingManual: !!uploads.trainingManual,
        leadership: !!drone.accountableManagerId,
        infrastructure: (uploads.infrastructureManufacturing?.length || 0) > 0,
        regulatory: (uploads.regulatoryDisplay?.length || 0) > 0,
        systemDesign: !!uploads.systemDesign,
        subcontractors: subcontractors.length > 0,
        hardware: (uploads.hardwareSecurity?.length || 0) > 0,
        webPortal: !!uploads.webPortalLink,
        manufacturedUnits: (drone.manufacturedUnits?.length || 0) > 0,
    };

    const renderTable = (data: any[], columns: string[], keys: string[], deleteKey: string) => (
        data.length > 0 ? (
            <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    {columns.map((col, i) => <Text key={i} style={styles.tableHeaderCell}>{col}</Text>)}
                    <Text style={styles.tableHeaderCell}>Del</Text>
                </View>
                {data.map((row, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        {keys.map((k, i) => <Text key={i} style={styles.tableCell}>{row[k]}</Text>)}
                        <TouchableOpacity onPress={() => deleteRecurring(deleteKey, idx)}>
                            <FontAwesome name="trash" size={14} color={Colors.dark.error} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        ) : <Text style={styles.emptyText}>No records yet</Text>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.detailHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color={Colors.dark.text} />
                </TouchableOpacity>
                <View style={styles.droneInfo}>
                    <Text style={styles.droneName}>{drone.modelName}</Text>
                    <Text style={styles.droneStatus}>DGCA TYPE CERTIFIED</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity style={[styles.tab, activeTab === 'info' && styles.activeTab]} onPress={() => setActiveTab('info')}>
                    <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>One Time</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'ops' && styles.activeTab]} onPress={() => setActiveTab('ops')}>
                    <Text style={[styles.tabText, activeTab === 'ops' && styles.activeTabText]}>Recurring</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInside}>
                {activeTab === 'info' ? (
                    <View style={styles.section}>
                        {/* 1. Organizational Manual */}
                        <AccordionItem title="1. Organizational Manual" description="Team members with name, phone, email and position" icon="users" isComplete={checks.orgManual}>
                            {teamMembers.map(m => (
                                <View key={m.id} style={styles.itemRow}>
                                    <View style={styles.itemIconSmall}><FontAwesome name="user" size={12} color={Colors.dark.primary} /></View>
                                    <View style={{ flex: 1 }}><Text style={styles.itemName}>{m.name}</Text><Text style={styles.itemRole}>{m.position}</Text></View>
                                    <Text style={styles.itemBadge}>{m.accessId}</Text>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/staff')}><Text style={styles.linkButtonText}>Manage Team →</Text></TouchableOpacity>
                        </AccordionItem>

                        {/* 2. Training Procedure Manual */}
                        <AccordionItem title="2. Training Procedure Manual" description="Upload training documentation" icon="file-text" isComplete={checks.trainingManual}>
                            <View style={styles.uploadBox}><FontAwesome name="cloud-upload" size={32} color={Colors.dark.textSecondary} /><Text style={styles.uploadText}>{uploads.trainingManual ? 'Manual Uploaded ✓' : 'Upload Training Manual (PDF)'}</Text></View>
                        </AccordionItem>

                        {/* 3. Nomination of Leadership */}
                        <AccordionItem title="3. Nomination of Leadership" description="Assign Accountable Manager" icon="user-secret" isComplete={checks.leadership}>
                            <Text style={styles.sectionLabel}>Select Accountable Manager:</Text>
                            <View style={styles.managerGrid}>
                                {teamMembers.map(m => (
                                    <TouchableOpacity key={m.id} style={[styles.managerCard, drone.accountableManagerId === m.id && styles.activeManager]} onPress={() => assignAccountableManager(drone.id, m.id)}>
                                        <Text style={styles.managerName}>{m.name}</Text><Text style={styles.managerRole}>{m.position}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </AccordionItem>

                        {/* 4. Infrastructure Setup */}
                        <AccordionItem title="4. Infrastructure Setup" description="Upload images of physical facilities" icon="building" isComplete={checks.infrastructure}>
                            <Text style={styles.sectionLabel}>Manufacturing Facility</Text>
                            <View style={styles.uploadBox}><Text style={styles.uploadText}>Upload Images</Text></View>
                            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Testing Facility</Text>
                            <View style={styles.uploadBox}><Text style={styles.uploadText}>Upload Images</Text></View>
                        </AccordionItem>

                        {/* 5. Regulatory Display */}
                        <AccordionItem title="5. Regulatory Display" description="TC display & fireproof plates" icon="shield" isComplete={checks.regulatory}>
                            <View style={styles.uploadBox}><Text style={styles.uploadText}>Upload TC Display Photos</Text></View>
                        </AccordionItem>

                        {/* 6. System Design */}
                        <AccordionItem title="6. System Design" description="Control and supervision procedures" icon="cogs" isComplete={checks.systemDesign}>
                            <View style={styles.uploadBox}><Text style={styles.uploadText}>{uploads.systemDesign ? 'Document Uploaded ✓' : 'Upload System Design (PDF)'}</Text></View>
                        </AccordionItem>

                        {/* 7. Sub-contractors Agreement */}
                        <AccordionItem title="7. Sub-contractors Agreement" description="Design and manufacturing partners" icon="handshake-o" isComplete={checks.subcontractors}>
                            {subcontractors.map(s => (
                                <View key={s.id} style={styles.itemRow}>
                                    <View style={[styles.itemIconSmall, { backgroundColor: '#F97316' + '20' }]}><FontAwesome name="building" size={12} color="#F97316" /></View>
                                    <View style={{ flex: 1 }}><Text style={styles.itemName}>{s.companyName}</Text><Text style={styles.itemRole}>{s.type}</Text></View>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.linkButton}><Text style={styles.linkButtonText}>Manage Subcontractors →</Text></TouchableOpacity>
                        </AccordionItem>

                        {/* 8. Hardware Security */}
                        <AccordionItem title="8. Hardware Security" description="Tamperproof requirements" icon="lock" isComplete={checks.hardware}>
                            <View style={styles.uploadBox}><Text style={styles.uploadText}>Upload Tamperproof Demo Images</Text></View>
                        </AccordionItem>

                        {/* 9. Web Portal */}
                        <AccordionItem title="9. Web Portal" description="Public access portal for UAS info" icon="globe" isComplete={checks.webPortal}>
                            <TextInput style={styles.mobileInput} placeholder="https://your-portal.com" value={webPortalLink} onChangeText={setWebPortalLink} placeholderTextColor={Colors.dark.textSecondary} />
                            <TouchableOpacity style={styles.addRecordBtn} onPress={() => updateWebPortal(drone.id, webPortalLink)}><Text style={styles.addRecordBtnText}>Save Portal Link</Text></TouchableOpacity>
                        </AccordionItem>

                        {/* 10. Manufactured Units */}
                        <AccordionItem title="10. Manufactured Units" description="Drone serial numbers & UIN" icon="wrench" isComplete={checks.manufacturedUnits}>
                            {drone.manufacturedUnits?.map((u, i) => (
                                <View key={i} style={styles.unitRow}><Text style={styles.unitSn}>{u.serialNumber}</Text><Text style={styles.unitUin}>UIN: {u.uin}</Text></View>
                            ))}
                            <View style={styles.inputForm}>
                                <TextInput style={styles.mobileInput} placeholder="Serial Number" value={newUnit.serialNumber} onChangeText={v => setNewUnit({ ...newUnit, serialNumber: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="UIN" value={newUnit.uin} onChangeText={v => setNewUnit({ ...newUnit, uin: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TouchableOpacity style={styles.addRecordBtn} onPress={() => { if (newUnit.serialNumber && newUnit.uin) { updateManufacturedUnits(drone.id, [...(drone.manufacturedUnits || []), newUnit]); setNewUnit({ serialNumber: '', uin: '' }); } }}><Text style={styles.addRecordBtnText}>+ Add Unit</Text></TouchableOpacity>
                            </View>
                        </AccordionItem>
                    </View>
                ) : (
                    <View style={styles.section}>
                        {/* 1. Coming Soon */}
                        <AccordionItem title="1. Coming Soon" description="This section will be added soon" icon="clock-o" isComplete={false}>
                            <Text style={styles.emptyText}>This item will be available in a future update.</Text>
                        </AccordionItem>

                        {/* 2. Personnel Management */}
                        <AccordionItem title="2. Personnel Management" description="Record of personnel changes" icon="users" isComplete={(recurring.personnel?.length || 0) > 0} status={recurring.personnel?.length ? (recurring.personnelReported ? { label: 'DGCA Notified', color: 'green' } : { label: 'Report to DGCA', color: 'yellow' }) : { label: 'No Change', color: 'green' }}>
                            {renderTable(recurring.personnel || [], ['Date', 'Position', 'Previous', 'New'], ['date', 'position', 'previous', 'new'], 'personnel')}
                            <View style={styles.inputForm}>
                                <TextInput style={styles.mobileInput} placeholder="Date (YYYY-MM-DD)" value={newPersonnel.date} onChangeText={v => setNewPersonnel({ ...newPersonnel, date: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Position" value={newPersonnel.position} onChangeText={v => setNewPersonnel({ ...newPersonnel, position: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Previous Person" value={newPersonnel.previous} onChangeText={v => setNewPersonnel({ ...newPersonnel, previous: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="New Person" value={newPersonnel.new} onChangeText={v => setNewPersonnel({ ...newPersonnel, new: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TouchableOpacity style={styles.addRecordBtn} onPress={() => addRecurring('personnel', newPersonnel, () => setNewPersonnel({ date: '', position: '', previous: '', new: '' }))}><Text style={styles.addRecordBtnText}>+ Add Change</Text></TouchableOpacity>
                            </View>
                        </AccordionItem>

                        {/* 3. Staff Competence */}
                        <AccordionItem title="3. Staff Competence" description="Random checks of staff understanding" icon="graduation-cap" isComplete={(recurring.staffCompetence?.length || 0) > 0}>
                            {renderTable(recurring.staffCompetence || [], ['Date', 'Staff', 'Examiner', 'Result'], ['date', 'staff', 'examiner', 'result'], 'staffCompetence')}
                            <View style={styles.inputForm}>
                                <TextInput style={styles.mobileInput} placeholder="Date" value={newStaffComp.date} onChangeText={v => setNewStaffComp({ ...newStaffComp, date: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Staff Name" value={newStaffComp.staff} onChangeText={v => setNewStaffComp({ ...newStaffComp, staff: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Examiner" value={newStaffComp.examiner} onChangeText={v => setNewStaffComp({ ...newStaffComp, examiner: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Result (Competent/Needs Training)" value={newStaffComp.result} onChangeText={v => setNewStaffComp({ ...newStaffComp, result: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TouchableOpacity style={styles.addRecordBtn} onPress={() => addRecurring('staffCompetence', newStaffComp, () => setNewStaffComp({ date: '', staff: '', examiner: '', result: '' }))}><Text style={styles.addRecordBtnText}>+ Add Record</Text></TouchableOpacity>
                            </View>
                        </AccordionItem>

                        {/* 4. Training Record */}
                        <AccordionItem title="4. Training Record" description="Training record of two years" icon="book" isComplete={(recurring.trainingRecords?.length || 0) > 0}>
                            {renderTable(recurring.trainingRecords || [], ['Date', 'Trainer', 'Session', 'Duration'], ['date', 'trainer', 'session', 'duration'], 'trainingRecords')}
                            <View style={styles.inputForm}>
                                <TextInput style={styles.mobileInput} placeholder="Date" value={newTraining.date} onChangeText={v => setNewTraining({ ...newTraining, date: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Trainer" value={newTraining.trainer} onChangeText={v => setNewTraining({ ...newTraining, trainer: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Session" value={newTraining.session} onChangeText={v => setNewTraining({ ...newTraining, session: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Duration" value={newTraining.duration} onChangeText={v => setNewTraining({ ...newTraining, duration: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TouchableOpacity style={styles.addRecordBtn} onPress={() => addRecurring('trainingRecords', newTraining, () => setNewTraining({ date: '', trainer: '', session: '', description: '', duration: '' }))}><Text style={styles.addRecordBtnText}>+ Add Record</Text></TouchableOpacity>
                            </View>
                        </AccordionItem>

                        {/* 5. Equipment Maintenance */}
                        <AccordionItem title="5. Equipment Maintenance" description="Calibration and service records" icon="wrench" isComplete={(recurring.equipmentMaintenance?.length || 0) > 0}>
                            {renderTable(recurring.equipmentMaintenance || [], ['Date', 'Equipment', 'Serial', 'Type'], ['date', 'equipment', 'serial', 'type'], 'equipmentMaintenance')}
                            <View style={styles.inputForm}>
                                <TextInput style={styles.mobileInput} placeholder="Date" value={newEquipment.date} onChangeText={v => setNewEquipment({ ...newEquipment, date: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Equipment Name" value={newEquipment.equipment} onChangeText={v => setNewEquipment({ ...newEquipment, equipment: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Serial No" value={newEquipment.serial} onChangeText={v => setNewEquipment({ ...newEquipment, serial: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Type (Calibration/Service)" value={newEquipment.type} onChangeText={v => setNewEquipment({ ...newEquipment, type: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TouchableOpacity style={styles.addRecordBtn} onPress={() => addRecurring('equipmentMaintenance', newEquipment, () => setNewEquipment({ date: '', equipment: '', serial: '', type: '', doneBy: '' }))}><Text style={styles.addRecordBtnText}>+ Add Record</Text></TouchableOpacity>
                            </View>
                        </AccordionItem>

                        {/* 6. Battery Safety */}
                        <AccordionItem title="6. Battery Safety" description="Battery and charger condition" icon="bolt" isComplete={(recurring.batterySafety?.length || 0) > 0}>
                            {renderTable(recurring.batterySafety || [], ['Date', 'Item', 'ID', 'Condition'], ['date', 'testedItem', 'itemId', 'condition'], 'batterySafety')}
                            <View style={styles.inputForm}>
                                <TextInput style={styles.mobileInput} placeholder="Date" value={newBatterySafety.date} onChangeText={v => setNewBatterySafety({ ...newBatterySafety, date: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Item (Battery/Charger)" value={newBatterySafety.testedItem} onChangeText={v => setNewBatterySafety({ ...newBatterySafety, testedItem: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Item ID" value={newBatterySafety.itemId} onChangeText={v => setNewBatterySafety({ ...newBatterySafety, itemId: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Condition (Excellent/Good/Poor)" value={newBatterySafety.condition} onChangeText={v => setNewBatterySafety({ ...newBatterySafety, condition: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TouchableOpacity style={styles.addRecordBtn} onPress={() => addRecurring('batterySafety', newBatterySafety, () => setNewBatterySafety({ date: '', testedItem: '', itemId: '', condition: '', testedBy: '' }))}><Text style={styles.addRecordBtnText}>+ Add Record</Text></TouchableOpacity>
                            </View>
                        </AccordionItem>

                        {/* 7. Operational Record */}
                        <AccordionItem title="7. Operational Record" description="UIN transfers and linking" icon="clipboard" isComplete={(recurring.operationalRecords?.length || 0) > 0}>
                            {renderTable(recurring.operationalRecords || [], ['Date', 'Operation', 'UIN'], ['date', 'operation', 'uin'], 'operationalRecords')}
                            <View style={styles.inputForm}>
                                <TextInput style={styles.mobileInput} placeholder="Date" value={newOperational.date} onChangeText={v => setNewOperational({ ...newOperational, date: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="Operation Type" value={newOperational.operation} onChangeText={v => setNewOperational({ ...newOperational, operation: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TextInput style={styles.mobileInput} placeholder="UIN" value={newOperational.uin} onChangeText={v => setNewOperational({ ...newOperational, uin: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                <TouchableOpacity style={styles.addRecordBtn} onPress={() => addRecurring('operationalRecords', newOperational, () => setNewOperational({ date: '', operation: '', uin: '', serialNumber: '', transferredTo: '' }))}><Text style={styles.addRecordBtnText}>+ Add Record</Text></TouchableOpacity>
                            </View>
                        </AccordionItem>

                        {/* 8. Coming Soon */}
                        <AccordionItem title="8. Coming Soon" description="This section will be added soon" icon="clock-o" isComplete={false}>
                            <Text style={styles.emptyText}>This item will be available in a future update.</Text>
                        </AccordionItem>

                        {/* 9. Procurement & UAS Sales */}
                        <AccordionItem title="9. Procurement & UAS Sales" description="Material and sales records" icon="shopping-cart" isComplete={(recurring.materialProcurement?.length || 0) > 0 || (recurring.uasSold?.length || 0) > 0}>
                            <View style={styles.toggleRow}>
                                <TouchableOpacity style={[styles.toggleBtn, recordType === 'material' && styles.toggleActive]} onPress={() => setRecordType('material')}><Text style={styles.toggleText}>Material</Text></TouchableOpacity>
                                <TouchableOpacity style={[styles.toggleBtn, recordType === 'uas' && styles.toggleActive]} onPress={() => setRecordType('uas')}><Text style={styles.toggleText}>UAS Sold</Text></TouchableOpacity>
                            </View>
                            {recordType === 'material' ? (
                                <>
                                    {renderTable(recurring.materialProcurement || [], ['Date', 'Material', 'Qty', 'Vendor'], ['date', 'material', 'quantity', 'vendor'], 'materialProcurement')}
                                    <View style={styles.inputForm}>
                                        <TextInput style={styles.mobileInput} placeholder="Date" value={newMaterial.date} onChangeText={v => setNewMaterial({ ...newMaterial, date: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                        <TextInput style={styles.mobileInput} placeholder="Material Name" value={newMaterial.material} onChangeText={v => setNewMaterial({ ...newMaterial, material: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                        <TextInput style={styles.mobileInput} placeholder="Quantity" value={newMaterial.quantity} onChangeText={v => setNewMaterial({ ...newMaterial, quantity: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                        <TextInput style={styles.mobileInput} placeholder="Vendor" value={newMaterial.vendor} onChangeText={v => setNewMaterial({ ...newMaterial, vendor: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                        <TouchableOpacity style={styles.addRecordBtn} onPress={() => addRecurring('materialProcurement', newMaterial, () => setNewMaterial({ date: '', material: '', quantity: '', vendor: '' }))}><Text style={styles.addRecordBtnText}>+ Add Record</Text></TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <>
                                    {renderTable(recurring.uasSold || [], ['Date', 'Serial', 'Sold To'], ['date', 'unitSerialNumber', 'soldTo'], 'uasSold')}
                                    <View style={styles.inputForm}>
                                        <TextInput style={styles.mobileInput} placeholder="Date" value={newUasSold.date} onChangeText={v => setNewUasSold({ ...newUasSold, date: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                        <TextInput style={styles.mobileInput} placeholder="Unit Serial Number" value={newUasSold.unitSerialNumber} onChangeText={v => setNewUasSold({ ...newUasSold, unitSerialNumber: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                        <TextInput style={styles.mobileInput} placeholder="Sold To" value={newUasSold.soldTo} onChangeText={v => setNewUasSold({ ...newUasSold, soldTo: v })} placeholderTextColor={Colors.dark.textSecondary} />
                                        <TouchableOpacity style={styles.addRecordBtn} onPress={() => addRecurring('uasSold', newUasSold, () => setNewUasSold({ date: '', unitSerialNumber: '', soldTo: '' }))}><Text style={styles.addRecordBtnText}>+ Add Record</Text></TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </AccordionItem>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, fontWeight: '600' },
    detailHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, borderBottomWidth: 1.5 },
    backButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    droneInfo: { flex: 1 },
    droneName: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
    droneStatus: { fontSize: 10, fontWeight: '900', marginTop: 4, letterSpacing: 2, textTransform: 'uppercase' },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1.5 },
    tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
    activeTab: { borderBottomWidth: 3 },
    tabText: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    scrollContent: { flex: 1 },
    scrollInside: { padding: 16, paddingBottom: 60 },
    section: { gap: 16 },
    accordionContainer: { borderRadius: 24, overflow: 'hidden', borderWidth: 1.5, marginBottom: 16 },
    accordionHeader: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
    iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    headerInfo: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    accordionTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    accordionSubtitle: { fontSize: 12, marginTop: 4, fontWeight: '500' },
    accordionContent: { padding: 18, borderTopWidth: 1.5 },
    itemRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, gap: 12, marginBottom: 8, borderWidth: 1 },
    itemIconSmall: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    itemName: { fontSize: 14, fontWeight: '700' },
    itemRole: { fontSize: 12, fontWeight: '500' },
    itemBadge: { fontSize: 11, fontWeight: '800' },
    linkButton: { marginTop: 12, paddingVertical: 8, alignItems: 'center' },
    linkButtonText: { fontSize: 14, fontWeight: '700' },
    uploadBox: { height: 100, borderWidth: 2, borderStyle: 'dashed', borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 10 },
    uploadText: { fontSize: 13, fontWeight: '600' },
    sectionLabel: { fontSize: 11, fontWeight: '900', marginBottom: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
    managerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    managerCard: { width: '48%', padding: 14, borderRadius: 18, borderWidth: 1.5 },
    managerName: { fontSize: 14, fontWeight: '800' },
    managerRole: { fontSize: 12, fontWeight: '500', marginTop: 4 },
    unitRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 18, marginBottom: 10, borderWidth: 1 },
    unitSn: { fontSize: 15, fontWeight: '800' },
    unitUin: { fontSize: 12, fontWeight: '700', marginTop: 2 },
    inputForm: { marginTop: 12, gap: 12, padding: 16, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed' },
    mobileInput: { borderRadius: 14, padding: 14, fontSize: 14, fontWeight: '500', borderWidth: 1.5 },
    addRecordBtn: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
    addRecordBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
    emptyText: { textAlign: 'center', padding: 24, fontSize: 13, fontStyle: 'italic', fontWeight: '500' },
    tableContainer: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
    tableHeader: { flexDirection: 'row', padding: 12 },
    tableHeaderCell: { flex: 1, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    tableRow: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, alignItems: 'center' },
    tableCell: { flex: 1, fontSize: 12, fontWeight: '600' },
    toggleRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    toggleBtn: { flex: 1, padding: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.dark.border },
    toggleActive: { backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary },
    toggleText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, color: Colors.dark.textSecondary },
    activeTabText: { color: Colors.dark.primary },
    activeManager: { borderColor: Colors.dark.primary, backgroundColor: Colors.dark.primary + '15' },
});
