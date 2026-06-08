const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app', '(tabs)');

const allFiles = [
    'drones.tsx', 'staff.tsx', 'subcontractors.tsx', 'inventory.tsx',
    'orders.tsx', 'batteries.tsx', 'flights.tsx', 'organizations.tsx', 'expenses.tsx'
];

for (const file of allFiles) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the ProtectedRoute import
    content = content.replace(/import ProtectedRoute from '\.\.\/\.\.\/components\/ProtectedRoute';\n?/g, '');
    
    // Find the wrapper at the bottom:
    // export default function XYZ() {
    //     return (
    //         <ProtectedRoute allowedRoles={['...']}>
    //             <XYZContent />
    //         </ProtectedRoute>
    //     );
    // }
    
    const wrapperRegex = /\nexport default function ([a-zA-Z0-9_]+)\(\) \{\s*return \(\s*<ProtectedRoute[^>]*>\s*<([a-zA-Z0-9_]+)Content \/>\s*<\/ProtectedRoute>\s*\);\s*\}\s*$/m;
    
    const match = content.match(wrapperRegex);
    if (match) {
        // remove the wrapper
        content = content.replace(wrapperRegex, '');
        // restore the original export default function XYZ()
        const componentName = match[1];
        content = content.replace(new RegExp(`function ${componentName}Content\\(\\) \\{`), `export default function ${componentName}() {`);
        
        fs.writeFileSync(filePath, content);
        console.log('Unprotected ' + file);
    }
}

// Now protect accounts.tsx
const accountsPath = path.join(dir, 'accounts.tsx');
if (fs.existsSync(accountsPath)) {
    let accContent = fs.readFileSync(accountsPath, 'utf8');
    if (!accContent.includes('ProtectedRoute')) {
        const match = accContent.match(/export default function ([a-zA-Z0-9_]+)\s*\(\)\s*\{/);
        if (match) {
            const componentName = match[1];
            accContent = accContent.replace(match[0], 'function ' + componentName + 'Content() {');
            
            const importStatement = "import ProtectedRoute from '../../components/ProtectedRoute';\n";
            const lastImportIndex = accContent.lastIndexOf('import ');
            const endOfLastImport = accContent.indexOf('\n', lastImportIndex);
            accContent = accContent.slice(0, endOfLastImport + 1) + importStatement + accContent.slice(endOfLastImport + 1);
            
            const exportStatement = "\nexport default function " + componentName + "() {\n" +
            "    return (\n" +
            "        <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATION']}>\n" +
            "            <" + componentName + "Content />\n" +
            "        </ProtectedRoute>\n" +
            "    );\n" +
            "}\n";
            
            accContent += exportStatement;
            fs.writeFileSync(accountsPath, accContent);
            console.log('Protected accounts.tsx');
        }
    }
}
