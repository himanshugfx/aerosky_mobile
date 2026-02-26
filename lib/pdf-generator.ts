import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
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
                <tr><th>Order Date</th><td>${new Date(order.orderDate).toLocaleDateString()}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Technical Configuration</div>
            <table>
                <tr><th>Drone Model</th><td>${order.droneModel}</td></tr>
                <tr><th>Drone Type</th><td>${order.droneType}</td></tr>
                <tr><th>Weight Class</th><td>${order.weightClass}</td></tr>
                <tr><th>Contract Value</th><td>INR ${order.contractValue.toLocaleString()}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Status & Compliance</div>
            <table>
                <tr><th>Manufacturing Stage</th><td><span class="badge badge-blue">${order.manufacturingStage}</span></td></tr>
                <tr><th>BOM Readiness</th><td>${order.bomReadiness}</td></tr>
                <tr><th>Certification Status</th><td>${order.dgcaFaaCertificationStatus}</td></tr>
            </table>
        </div>

        ${order.uploads && order.uploads.length > 0 ? `
        <div class="section" style="page-break-before: always;">
            <div class="section-title">Attached Documents</div>
            ${order.uploads.map((u, i) => `
                <div class="document-item">
                    <div class="document-name">${i + 1}. ${u.fileName}</div>
                    ${u.fileData.startsWith('data:image/') ? `
                        <img src="${u.fileData}" class="document-img" />
                    ` : `
                        <div style="color: #2563eb; font-size: 12px;">(PDF Document - Metadata only on mobile report)</div>
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
