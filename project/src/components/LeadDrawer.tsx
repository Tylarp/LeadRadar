import {
  X,
  Globe,
  Phone,
  Mail,
  Star,
  TrendingUp,
  Share2,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import type { Lead } from '@/lib/types';
import { ScoreBadge } from '@/components/Badges';

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

export function LeadDrawer({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{lead.business_name}</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              {lead.website ? (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {lead.website.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <span className="text-red-600">No website</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex-1 rounded-xl bg-slate-50 p-3 text-center">
              <div className="text-xs text-slate-500">Website score</div>
              <div className="mt-1 flex justify-center">
                <ScoreBadge score={lead.website_quality_score} />
              </div>
            </div>
            <div className="flex-1 rounded-xl bg-slate-50 p-3 text-center">
              <div className="text-xs text-slate-500">Google rating</div>
              <div className="mt-1 flex items-center justify-center gap-1 font-semibold text-slate-900">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {lead.google_rating.toFixed(1)}
              </div>
            </div>
          </div>

          <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={lead.phone} />
          <InfoRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={<a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>}
          />
          <InfoRow
            icon={<Globe className="h-4 w-4" />}
            label="Website"
            value={lead.website ? 'Live' : 'None'}
          />
          <InfoRow
            icon={<MessageSquare className="h-4 w-4" />}
            label="Reviews"
            value={`${lead.review_count}`}
          />
          <InfoRow
            icon={<Share2 className="h-4 w-4" />}
            label="Social presence"
            value={lead.has_social ? 'Yes' : 'None'}
          />
          <InfoRow
            icon={<TrendingUp className="h-4 w-4" />}
            label="Est. monthly traffic"
            value={lead.estimated_traffic.toLocaleString()}
          />

          <div className="mt-6">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Sales angles ({lead.problems.length})
            </h4>
            <ul className="space-y-2">
              {lead.problems.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-inset ring-amber-100"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <a
            href={`mailto:${lead.email}?subject=Improving ${encodeURIComponent(lead.business_name)}'s online presence`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Mail className="h-4 w-4" />
            Draft outreach email
          </a>
        </div>
      </div>
    </div>
  );
}
