'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/admin/Card';
import { Plus, Trash2, GripVertical, ArrowRight, Save, Edit } from 'lucide-react';

interface WorkflowStep {
  id: string;
  role: string;
  name: string;
  order: number;
  canApprove: boolean;
  canReject: boolean;
}

const initialSteps: WorkflowStep[] = [
  { id: '1', role: 'Letter Writer', name: 'Create Draft', order: 1, canApprove: false, canReject: false },
  { id: '2', role: 'Sporting Director', name: 'Review & Approve', order: 2, canApprove: true, canReject: true },
  { id: '3', role: 'Director', name: 'Final Approval', order: 3, canApprove: true, canReject: true },
  { id: '4', role: 'Admin', name: 'Archive & Send', order: 4, canApprove: false, canReject: false },
];

const roleOptions = ['Letter Writer', 'Sporting Director', 'Director', 'Admin', 'Approver', 'Manager'];

export default function WorkflowPage() {
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<string | null>(null);

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: String(steps.length + 1),
      role: 'Approver',
      name: 'New Step',
      order: steps.length + 1,
      canApprove: true,
      canReject: true,
    };
    setSteps([...steps, newStep]);
  };

  const handleDeleteStep = (id: string) => {
    if (confirm('Are you sure you want to delete this step?')) {
      setSteps(steps.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
    }
  };

  const handleUpdateStep = (id: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
    setEditingStep(null);
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = steps.findIndex(s => s.id === draggedItem);
    const targetIndex = steps.findIndex(s => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSteps = [...steps];
    const [removed] = newSteps.splice(draggedIndex, 1);
    newSteps.splice(targetIndex, 0, removed);

    setSteps(newSteps.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approval Workflow Settings</h1>
        <p className="text-gray-600 mt-1">Configure the approval workflow for letters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workflow Steps</CardTitle>
                <button
                  onClick={handleAddStep}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Step
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    draggable
                    onDragStart={() => handleDragStart(step.id)}
                    onDragOver={(e) => handleDragOver(e, step.id)}
                    onDragEnd={handleDragEnd}
                    className={`border-2 rounded-lg p-4 transition-colors cursor-move ${
                      draggedItem === step.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Drag Handle */}
                      <div className="pt-1">
                        <GripVertical size={20} className="text-gray-400" />
                      </div>

                      {/* Step Number */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shrink-0">
                        {step.order}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        {editingStep === step.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={step.name}
                              onChange={(e) => setSteps(steps.map(s => s.id === step.id ? { ...s, name: e.target.value } : s))}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Step name"
                            />
                            <select
                              value={step.role}
                              onChange={(e) => setSteps(steps.map(s => s.id === step.id ? { ...s, role: e.target.value } : s))}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {roleOptions.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={step.canApprove}
                                  onChange={(e) => setSteps(steps.map(s => s.id === step.id ? { ...s, canApprove: e.target.checked } : s))}
                                  className="rounded"
                                />
                                Can Approve
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={step.canReject}
                                  onChange={(e) => setSteps(steps.map(s => s.id === step.id ? { ...s, canReject: e.target.checked } : s))}
                                  className="rounded"
                                />
                                Can Reject
                              </label>
                            </div>
                            <button
                              onClick={() => setEditingStep(null)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              Done
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">{step.name}</h4>
                              <button
                                onClick={() => setEditingStep(step.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Role: {step.role}</p>
                            <div className="flex items-center gap-3 mt-2">
                              {step.canApprove && (
                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                  Can Approve
                                </span>
                              )}
                              {step.canReject && (
                                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                                  Can Reject
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Arrow to next step */}
                    {index < steps.length - 1 && (
                      <div className="flex justify-center mt-3">
                        <ArrowRight size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Save size={20} />
              Save Workflow
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Steps</p>
                  <p className="text-2xl font-bold text-gray-900">{steps.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approval Points</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {steps.filter(s => s.canApprove).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rejection Points</p>
                  <p className="text-2xl font-bold text-red-600">
                    {steps.filter(s => s.canReject).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Drag steps to reorder the workflow</p>
                <p>• Click edit icon to modify step details</p>
                <p>• Add new steps with the "Add Step" button</p>
                <p>• Configure approval and rejection permissions for each role</p>
                <p>• Save changes when finished</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
