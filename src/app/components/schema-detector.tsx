import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface SchemaDetectorProps {
  onClose: () => void;
}

export function SchemaDetector({ onClose }: SchemaDetectorProps) {
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectSchema();
  }, []);

  const detectSchema = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cfc035a/schema`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSchema(data.schema);
        console.log('📊 Database Schema:', data.schema);
      } else {
        setError(data.error || 'Failed to detect schema');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      setSeeding(true);
      setError(null);
      console.log('🌱 Seeding database...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cfc035a/admin/seed-all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Database seeded successfully!');
        // Refresh schema to show updated row counts
        await detectSchema();
        alert('✅ Database seeded successfully! Ready to use.');
      } else {
        // Better error handling
        const errorMsg = data.error || 'Seeding failed';
        const details = data.details || '';
        const stack = data.stack || '';
        
        console.error('❌ Seeding failed:', errorMsg);
        console.error('Details:', details);
        console.error('Stack:', stack);
        
        throw new Error(`${errorMsg}\n\nDetails: ${details}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ Seeding error:', errorMsg);
      setError(`Seeding failed: ${errorMsg}`);
      alert(`❌ Seeding failed!\n\n${errorMsg}\n\nCheck the browser console for more details.`);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-white border-2 border-blue-500 rounded-lg shadow-lg p-6 max-w-md z-50">
        <h3 className="text-lg font-bold text-blue-600 mb-2">
          🔍 Detecting Database Schema...
        </h3>
        <p className="text-sm text-gray-600">Please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-white border-2 border-red-500 rounded-lg shadow-lg p-6 max-w-md z-50">
        <h3 className="text-lg font-bold text-red-600 mb-2">
          ❌ Schema Detection Error
        </h3>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  if (!schema) return null;

  const existingTables = Object.entries(schema)
    .filter(([_, info]: [string, any]) => info.exists)
    .map(([name, info]: [string, any]) => ({ name, ...info }));

  return (
    <div className="fixed top-4 right-4 bg-white border-2 border-green-600 rounded-lg shadow-xl p-6 max-w-2xl max-h-[80vh] overflow-auto z-50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-green-600">
          ✅ Database Schema Detected
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-sm font-medium text-green-800">
            Found {existingTables.length} existing tables
          </p>
        </div>

        {existingTables.map((table) => (
          <div key={table.name} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-gray-800 text-lg">{table.name}</h4>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {table.rowCount} rows
              </span>
            </div>
            
            {table.columns && table.columns.length > 0 ? (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Columns:</p>
                <div className="flex flex-wrap gap-1">
                  {table.columns.map((col: string) => (
                    <span
                      key={col}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic mt-2">
                Table is empty - columns unknown
              </p>
            )}
          </div>
        ))}

        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <button
            onClick={seedDatabase}
            disabled={seeding}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            {seeding ? '🌱 Seeding Database...' : '🌱 Seed Database with Sample Data'}
          </button>
          
          <button
            onClick={detectSchema}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            🔄 Refresh Schema
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Continue to App →
          </button>
        </div>
      </div>
    </div>
  );
}