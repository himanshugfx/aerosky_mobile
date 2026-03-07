import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { Order } from './types';

export const generateOrderPDF = async (order: Order) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                font-family: 'Helvetica', Arial, sans-serif; 
                color: #1e293b; 
                margin: 0; 
                padding: 40px; 
                background: #fff;
            }
            .header {
                background-color: #2563eb;
                color: white;
                padding: 30px;
                border-radius: 12px;
                margin-bottom: 30px;
            }
            .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
            .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
            
            .section { margin-bottom: 30px; }
            .section-title { 
                font-size: 18px; 
                font-weight: bold; 
                color: #2563eb; 
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 10px;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { 
                padding: 12px; 
                text-align: left; 
                border-bottom: 1px solid #f1f5f9;
                font-size: 14px;
            }
            th { color: #64748b; font-weight: 600; width: 30%; }
            td { color: #1e293b; font-weight: 500; }
            
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            
            .badge {
                padding: 4px 12px;
                border-radius: 99px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .badge-blue { background: #dbeafe; color: #1e40af; }
            
            .document-item {
                margin-bottom: 15px;
                padding: 10px;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
            }
            .document-name { font-size: 12px; color: #64748b; margin-bottom: 10px; }
            .document-img { max-width: 100%; border-radius: 4px; }
            
            .footer {
                margin-top: 50px;
                text-align: center;
                font-size: 10px;
                color: #94a3b8;
                border-top: 1px solid #f1f5f9;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>AEROSYS AVIATION</h1>
            <p>MANUFACTURING ORDER DETAILS - ${order.contractNumber}</p>
        </div>

        <div class="section">
            <div class="section-title">Core Information</div>
            <table>
                <tr><th>Contract Number</th><td>${order.contractNumber}</td></tr>
                <tr><th>Client Name</th><td>${order.clientName}</td></tr>
                <tr><th>Client Segment</th><td>${order.clientSegment}</td></tr>
                <tr><th>POC</th><td>${order.contactPerson || 'N/A'} (${order.contactPhone || 'N/A'})</td></tr>
                <tr><th>Email</th><td>${order.contactEmail || 'N/A'}</td></tr>
                <tr><th>Delivery Address</th><td>${order.deliveryAddress || 'N/A'}</td></tr>
                <tr><th>Order Date</th><td>${new Date(order.orderDate).toLocaleDateString()}</td></tr>
                <tr><th>Est. Completion</th><td>${order.estimatedCompletionDate ? new Date(order.estimatedCompletionDate).toLocaleDateString() : 'N/A'}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Financial Details</div>
            <table>
                <tr><th>Quantity</th><td>${order.quantity || 1}</td></tr>
                <tr><th>Unit Price</th><td>${order.currency} ${order.unitPrice?.toLocaleString() || '0'}</td></tr>
                <tr><th>Contract Value</th><td>${order.currency} ${order.contractValue.toLocaleString()}</td></tr>
                <tr><th>Payment Terms</th><td>${order.paymentTerms || 'N/A'}</td></tr>
                <tr><th>Payment Status</th><td>${order.paymentStatus || 'Unpaid'}</td></tr>
                <tr><th>Revenue Status</th><td>${order.revenueRecognitionStatus}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Technical Configuration</div>
            <table>
                <tr><th>Drone Model</th><td>${order.droneModel}</td></tr>
                <tr><th>Drone Type</th><td>${order.droneType}</td></tr>
                <tr><th>Weight Class</th><td>${order.weightClass}</td></tr>
                <tr><th>Payload</th><td>${order.payloadConfiguration || 'N/A'}</td></tr>
                <tr><th>Endurance</th><td>${order.flightEnduranceRequirements || 'N/A'}</td></tr>
                <tr><th>Software Tier</th><td>${order.softwareAiTier || 'N/A'}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Compliance & Regulatory</div>
            <table>
                <tr><th>UIN</th><td>${order.uin || 'N/A'}</td></tr>
                <tr><th>Certification Status</th><td>${order.dgcaFaaCertificationStatus}</td></tr>
                <tr><th>Export License</th><td>${order.exportLicenseStatus || 'N/A'}</td></tr>
                <tr><th>Geofencing</th><td>${order.geofencingRequirements || 'N/A'}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Operational Status</div>
            <table>
                <tr><th>Priority Level</th><td><span class="badge badge-blue">${order.priorityLevel || 'Normal'}</span></td></tr>
                <tr><th>Manufacturing Stage</th><td><span class="badge badge-blue">${order.manufacturingStage}</span></td></tr>
                <tr><th>BOM Readiness</th><td>${order.bomReadiness}</td></tr>
                <tr><th>Quality Check</th><td>${order.qualityCheckStatus || 'Pending'}</td></tr>
                <tr><th>Warranty Terms</th><td>${order.warrantyTerms || 'N/A'}</td></tr>
                <tr><th>After-Sales/AMC</th><td>${order.afterSalesAmc || 'N/A'}</td></tr>
                <tr><th>Calibration Logs</th><td>${order.calibrationTestLogs || 'N/A'}</td></tr>
            </table>
        </div>

        ${order.manufacturingNotes ? `
        <div class="section">
            <div class="section-title">Critical Manufacturing Notes</div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${order.manufacturingNotes}</div>
        </div>
        ` : ''}

        ${order.specialRequirements ? `
        <div class="section">
            <div class="section-title">Special Requirements</div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${order.specialRequirements}</div>
        </div>
        ` : ''}

        ${order.internalOrderNotes ? `
        <div class="section">
            <div class="section-title">Internal Team Notes</div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #eab308; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${order.internalOrderNotes}</div>
        </div>
        ` : ''}

        ${order.uploads && order.uploads.length > 0 ? `
        <div class="section" style="page-break-before: always;">
            <div class="section-title">Attached Documents</div>
            ${order.uploads.map((u, i) => `
                <div class="document-item">
                    <div class="document-name">${i + 1}. ${u.fileName}</div>
                    ${u.fileData && u.fileData.startsWith('data:image/') ? `
                        <img src="${u.fileData}" class="document-img" />
                    ` : `
                        <div style="color: #2563eb; font-size: 12px;">(Document attached - View in App)</div>
                    `}
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="footer">
            Aerosys Aviation India - Confidential Document - System Generated on ${new Date().toLocaleString()}
        </div>
    </body>
    </html>
    `;

    try {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });

        // Move to a named file so it opens properly
        const pdfName = `Order_${order.contractNumber}_${Date.now()}.pdf`;
        const newUri = `${FileSystem.cacheDirectory}${pdfName}`;
        await FileSystem.moveAsync({ from: uri, to: newUri });

        // Share/open the PDF
        await Sharing.shareAsync(newUri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: `Order ${order.contractNumber}`,
        });
    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
};
