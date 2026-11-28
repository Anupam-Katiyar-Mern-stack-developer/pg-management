// src/pages/super-admin/SiteSettingsSeoPage.tsx
import React, { useEffect, useState } from 'react';
import { Globe, CheckCircle2 } from 'lucide-react';
import { Badge, Button, Card, Input } from '../../components/common';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchSuperAdminDataThunk,
    resetSeoSavedFlag,
    saveSeoSettings,
} from '../../store/slices/superAdminSlice';
import type { SiteSeoSettings } from '../../services/superAdmin.service';

export const SiteSettingsSeoPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { seoSettings, seoSaved } = useAppSelector((state) => state.superAdmin);
    const [form, setForm] = useState<SiteSeoSettings | null>(null);

    useEffect(() => {
        if (!seoSettings) dispatch(fetchSuperAdminDataThunk());
    }, [dispatch, seoSettings]);

    useEffect(() => {
        if (seoSettings) setForm(seoSettings);
    }, [seoSettings]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form) return;
        dispatch(saveSeoSettings(form));
        setTimeout(() => dispatch(resetSeoSavedFlag()), 2500);
    };

    if (!form) {
        return <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-indigo-600" />
                        Website Settings & SEO
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Optimize how StayFlow appears on Google Search and manage platform-wide settings.
                    </p>
                </div>

                {seoSaved && (
                    <Badge variant="success" size="sm" className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Settings Saved
                    </Badge>
                )}
            </div>

            {/* Live Google Search Snippet Preview */}
            <Card padding="md" className="bg-slate-50/80 space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Google Search Preview
                </p>
                <p className="text-xs text-emerald-700">https://stayflow.in</p>
                <p className="text-lg font-medium text-indigo-700 leading-snug">
                    {form.seoTitle || 'Website Title'}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                    {form.seoDescription || 'Meta description will appear here...'}
                </p>
            </Card>

            {/* Settings Form */}
            <Card padding="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Website Name"
                            required
                            value={form.siteName}
                            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                        />
                        <Input
                            label="Global Support Email"
                            type="email"
                            required
                            value={form.supportEmail}
                            onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Global SEO Meta Title"
                        required
                        value={form.seoTitle}
                        onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Global Meta Description
                        </label>
                        <textarea
                            rows={3}
                            required
                            value={form.seoDescription}
                            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <Input
                        label="SEO Keywords (comma separated)"
                        value={form.seoKeywords}
                        onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                    />

                    <label className="flex items-center gap-2.5 pt-2 cursor-pointer text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.maintenanceMode}
                            onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Enable Maintenance Mode (temporarily pause public bookings)
                    </label>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" variant="primary">
                            Save Settings & SEO
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};