const fs = require('fs');
const path = require('path');

const rolesMap = {
    'drones.tsx': ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'],
    'staff.tsx': ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'],
    'subcontractors.tsx': ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'],
    'inventory.tsx': ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'],
    'orders.tsx': ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'],
    'batteries.tsx': ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'],
    'flights.tsx': ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'],
    'organizations.tsx': ['SUPER_ADMIN'],
    'expenses.tsx': ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATION']
};

const dir = path.join(__dirname, 'app', '(tabs)');

for (const [file, roles] of Object.entries(rolesMap)) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('ProtectedRoute')) continue;
    
    const match = content.match(/export default function ([a-zA-Z0-9_]+)\s*\(\)\s*\{/);
    if (!match) {
        console.log('Could not find export default in ' + file);
        continue;
    }
    
    const componentName = match[1];
    
    content = content.replace(match[0], 'function ' + componentName + 'Content() {');
    
    const importStatement = "import ProtectedRoute from '../../components/ProtectedRoute';\n";
    
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
    
    const rolesStr = roles.map(r => "'" + r + "'").join(', ');
    const exportStatement = "\nexport default function " + componentName + "() {\n" +
    "    return (\n" +
    "        <ProtectedRoute allowedRoles={[" + rolesStr + "]}>\n" +
    "            <" + componentName + "Content />\n" +
    "        </ProtectedRoute>\n" +
    "    );\n" +
    "}\n";

    content += exportStatement;
    
    fs.writeFileSync(filePath, content);
    console.log('Protected ' + file);
}
