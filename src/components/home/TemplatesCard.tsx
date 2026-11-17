import React, { useState } from 'react';
import {
  FileCode2,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmailTemplate, TemplateCategory } from '../../types';

export const TemplatesCard: React.FC = () => {
  const {
    templates,
    setDraftField,
    addCustomTemplate,
    updateCustomTemplate,
    removeCustomTemplate,
    addToast,
    scrollToForm,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  // Form states for modal
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('Business');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const openCreateModal = () => {
    setEditingTemplate(null);
    setName('');
    setCategory('Business');
    setDescription('');
    setSubject('');
    setBody('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: EmailTemplate) => {
    setEditingTemplate(t);
    setName(t.name);
    setCategory(t.category);
    setDescription(t.description);
    setSubject(t.subject);
    setBody(t.body);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !body.trim()) {
      addToast('error', 'Please fill in the template name, subject, and body.');
      return;
    }

    if (editingTemplate) {
      await updateCustomTemplate({
        ...editingTemplate,
        name: name.trim(),
        category,
        description: description.trim() || `${category} template`,
        subject: subject.trim(),
        body: body.trim(),
      });
    } else {
      await addCustomTemplate({
        name: name.trim(),
        category,
        description: description.trim() || `${category} template`,
        subject: subject.trim(),
        body: body.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleUseTemplate = (t: EmailTemplate) => {
    setDraftField('subject', t.subject);
    setDraftField('body', t.body);
    addToast('success', `Applied template "${t.name}"!`);
    scrollToForm();
  };

  const getCategoryBadgeClass = (cat: TemplateCategory) => {
    switch (cat) {
      case 'Sales':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800/60';
      case 'Marketing':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300/60 dark:border-amber-800/60';
      case 'Business':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300/60 dark:border-blue-800/60';
      case 'Relationship':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300 border-pink-300/60 dark:border-pink-800/60';
      case 'Other':
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-6 transition-all">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
            <FileCode2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-[#2F6B2F] dark:text-emerald-400">
              Email Templates
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pick high-converting scripts or create your own custom copies
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3 py-1.5 rounded-xl bg-[#2F6B2F] hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="flex flex-col justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-500/50 transition-all hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                  {tpl.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                    tpl.category
                  )}`}
                >
                  {tpl.category}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                {tpl.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-1">
                {tpl.isCustom && (
                  <>
                    <button
                      onClick={() => openEditModal(tpl)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Edit template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeCustomTemplate(tpl.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => handleUseTemplate(tpl)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-800 dark:text-emerald-300 hover:text-white font-semibold text-xs flex items-center gap-1 transition-all"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating / Editing Custom Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 z-10 flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {editingTemplate ? 'Edit Template' : 'Create Custom Template'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. VIP Demo Follow-up"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Business">Business</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Relationship">Relationship</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short 1-line summary"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Subject Line (Max 200)
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question regarding growth goals, {name}"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-semibold text-slate-800 dark:text-slate-200">
                    Email Body (Max 2000)
                  </label>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    Supports {'{name}'}
                  </span>
                </div>
                <textarea
                  required
                  rows={6}
                  maxLength={2000}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Hi {name},&#10;&#10;Write your message body here..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2F6B2F] hover:bg-emerald-800 text-white font-semibold shadow-md transition-all"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

