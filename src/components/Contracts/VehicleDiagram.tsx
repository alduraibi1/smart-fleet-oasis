import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface DamagePoint {
  id: string;
  view: 'front' | 'back' | 'left' | 'right' | 'top';
  x: number;
  y: number;
  severity: 'minor' | 'moderate' | 'major';
  description?: string;
}

interface VehicleDiagramProps {
  damages: DamagePoint[];
  onAddDamage?: (damage: Omit<DamagePoint, 'id'>) => void;
  onRemoveDamage?: (id: string) => void;
  interactive?: boolean;
  compact?: boolean;
}

export const VehicleDiagram = ({ 
  damages, 
  onAddDamage, 
  onRemoveDamage, 
  interactive = false,
  compact = false 
}: VehicleDiagramProps) => {
  const [selectedView, setSelectedView] = useState<DamagePoint['view']>('front');
  const [tempSeverity, setTempSeverity] = useState<DamagePoint['severity']>('moderate');

  const handleClick = (e: React.MouseEvent<SVGSVGElement>, view: DamagePoint['view']) => {
    if (!interactive || !onAddDamage) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onAddDamage({
      view,
      x,
      y,
      severity: tempSeverity,
    });
  };

  const getSeverityColor = (severity: DamagePoint['severity']) => {
    switch (severity) {
      case 'minor': return '#fbbf24'; // yellow
      case 'moderate': return '#f97316'; // orange
      case 'major': return '#ef4444'; // red
    }
  };

  const renderVehicleView = (view: DamagePoint['view'], title: string) => {
    const viewDamages = damages.filter(d => d.view === view);
    const size = compact ? 120 : 200;
    
    return (
      <div className="flex flex-col items-center gap-2">
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
        <div className="relative">
          <svg
            width={size}
            height={size * 0.6}
            viewBox="0 0 200 120"
            className={`border-2 border-gray-300 rounded-lg bg-gradient-to-br from-blue-50 to-white shadow-md ${
              interactive ? 'cursor-crosshair hover:border-blue-400 transition-colors' : ''
            }`}
            onClick={(e) => handleClick(e, view)}
          >
            {/* Vehicle outline based on view */}
            {view === 'front' && (
              <g>
                {/* Front view - windshield and hood */}
                <rect x="30" y="20" width="140" height="80" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" rx="10" />
                <rect x="50" y="30" width="100" height="40" fill="#c7d2fe" stroke="#4f46e5" strokeWidth="1.5" />
                <circle cx="60" cy="85" r="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="140" cy="85" r="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                <text x="100" y="65" textAnchor="middle" fontSize="12" fill="#6366f1" fontWeight="bold">أمامي</text>
              </g>
            )}
            {view === 'back' && (
              <g>
                {/* Back view */}
                <rect x="30" y="20" width="140" height="80" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" rx="10" />
                <rect x="50" y="30" width="100" height="40" fill="#fecaca" stroke="#dc2626" strokeWidth="1.5" />
                <circle cx="60" cy="85" r="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="140" cy="85" r="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                <text x="100" y="65" textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight="bold">خلفي</text>
              </g>
            )}
            {view === 'left' && (
              <g>
                {/* Left side view */}
                <ellipse cx="40" cy="60" rx="15" ry="25" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
                <rect x="50" y="35" width="100" height="50" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="2" rx="8" />
                <rect x="70" y="45" width="60" height="30" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5" />
                <ellipse cx="160" cy="60" rx="15" ry="25" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="70" cy="90" r="10" fill="#374151" stroke="#1f2937" strokeWidth="2" />
                <circle cx="130" cy="90" r="10" fill="#374151" stroke="#1f2937" strokeWidth="2" />
                <text x="100" y="65" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="bold">جانب أيسر</text>
              </g>
            )}
            {view === 'right' && (
              <g>
                {/* Right side view */}
                <ellipse cx="160" cy="60" rx="15" ry="25" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                <rect x="50" y="35" width="100" height="50" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" rx="8" />
                <rect x="70" y="45" width="60" height="30" fill="#a5b4fc" stroke="#6366f1" strokeWidth="1.5" />
                <ellipse cx="40" cy="60" rx="15" ry="25" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                <circle cx="70" cy="90" r="10" fill="#374151" stroke="#1f2937" strokeWidth="2" />
                <circle cx="130" cy="90" r="10" fill="#374151" stroke="#1f2937" strokeWidth="2" />
                <text x="100" y="65" textAnchor="middle" fontSize="11" fill="#6366f1" fontWeight="bold">جانب أيمن</text>
              </g>
            )}
            {view === 'top' && (
              <g>
                {/* Top view */}
                <rect x="50" y="20" width="100" height="80" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" rx="15" />
                <rect x="60" y="30" width="80" height="25" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" rx="5" />
                <rect x="60" y="65" width="80" height="25" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" rx="5" />
                <text x="100" y="65" textAnchor="middle" fontSize="12" fill="#d97706" fontWeight="bold">علوي</text>
              </g>
            )}

            {/* Damage points */}
            {viewDamages.map((damage) => (
              <g key={damage.id}>
                <circle
                  cx={(damage.x / 100) * 200}
                  cy={(damage.y / 100) * 120}
                  r={compact ? 6 : 8}
                  fill={getSeverityColor(damage.severity)}
                  stroke="white"
                  strokeWidth="2"
                  className="drop-shadow-lg animate-pulse"
                />
                {!compact && interactive && onRemoveDamage && (
                  <circle
                    cx={(damage.x / 100) * 200 + 8}
                    cy={(damage.y / 100) * 120 - 8}
                    r="6"
                    fill="white"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:fill-red-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveDamage(damage.id);
                    }}
                  />
                )}
              </g>
            ))}
          </svg>
          
          {/* Damage count badge */}
          {viewDamages.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
            >
              {viewDamages.length}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {interactive && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                كيفية استخدام المخطط التفاعلي
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 mr-4">
                <li>1. اختر مستوى خطورة الضرر أدناه</li>
                <li>2. انقر على موقع الضرر في المخطط</li>
                <li>3. كرر العملية لإضافة أضرار متعددة</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-700">مستوى الخطورة:</span>
            {(['minor', 'moderate', 'major'] as const).map((severity) => (
              <button
                key={severity}
                onClick={() => setTempSeverity(severity)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  tempSeverity === severity
                    ? 'ring-2 ring-offset-2 scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: getSeverityColor(severity),
                  color: 'white',
                  ...(tempSeverity === severity && {
                    ringColor: getSeverityColor(severity),
                  }),
                }}
              >
                {severity === 'minor' && '✓ بسيط'}
                {severity === 'moderate' && '⚡ متوسط'}
                {severity === 'major' && '⚠️ خطير'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`grid ${compact ? 'grid-cols-5' : 'grid-cols-3'} gap-4`}>
        {renderVehicleView('front', 'منظر أمامي')}
        {renderVehicleView('back', 'منظر خلفي')}
        {renderVehicleView('left', 'جانب أيسر')}
        {renderVehicleView('right', 'جانب أيمن')}
        {renderVehicleView('top', 'منظر علوي')}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-4 text-xs flex-wrap justify-center">
          <span className="font-semibold text-gray-700">المفتاح:</span>
          {(['minor', 'moderate', 'major'] as const).map((severity) => (
            <div key={severity} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: getSeverityColor(severity) }}
              />
              <span className="text-gray-600">
                {severity === 'minor' && 'بسيط'}
                {severity === 'moderate' && 'متوسط'}
                {severity === 'major' && 'خطير'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Damage summary */}
      {damages.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
          <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
            <span className="text-lg">📋</span>
            ملخص الأضرار ({damages.length})
          </h4>
          <div className="space-y-1 text-sm">
            {damages.map((damage, index) => (
              <div key={damage.id} className="flex items-center justify-between bg-white rounded px-2 py-1.5 border border-red-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">{index + 1}.</span>
                  <span className="text-gray-600">
                    {damage.view === 'front' && 'أمامي'}
                    {damage.view === 'back' && 'خلفي'}
                    {damage.view === 'left' && 'جانب أيسر'}
                    {damage.view === 'right' && 'جانب أيمن'}
                    {damage.view === 'top' && 'علوي'}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                    style={{
                      backgroundColor: getSeverityColor(damage.severity) + '20',
                      borderColor: getSeverityColor(damage.severity),
                      color: getSeverityColor(damage.severity),
                    }}
                  >
                    {damage.severity === 'minor' && 'بسيط'}
                    {damage.severity === 'moderate' && 'متوسط'}
                    {damage.severity === 'major' && 'خطير'}
                  </Badge>
                </div>
                {interactive && onRemoveDamage && (
                  <button
                    onClick={() => onRemoveDamage(damage.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
