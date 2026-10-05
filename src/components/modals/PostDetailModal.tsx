import React from 'react';
import { useData } from '../../context/DataContext';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  ThumbsUp,
  Repeat,
  MessageSquare,
  Eye,
  BrainCircuit,
  Search,
} from 'lucide-react';
import { classifyText } from '../../utils/nlp';

export const PostDetailModal: React.FC = () => {
  const { selectedPostForModal, setSelectedPostForModal, launchInvestigationForTopic } = useData();

  if (!selectedPostForModal) return null;

  const post = selectedPostForModal;
  const classification = classifyText(post.text);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-xl text-slate-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-900">{post.id}</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-xs text-slate-500">{post.platform}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                {new Date(post.timestamp).toLocaleString()}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-800 mt-1">{post.topic}</h2>
          </div>

          <button
            onClick={() => setSelectedPostForModal(null)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Post Text Body */}
        <div className="rounded border border-slate-200 bg-slate-50 p-4 mb-4">
          <p className="text-sm leading-relaxed text-slate-900">{post.text}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-2 font-mono">
            <span>Author: <strong className="text-slate-800">{post.authorId}</strong></span>
            <span>Cluster: {post.authorCluster}</span>
            <span>Lang: [{post.language.toUpperCase()}]</span>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4 font-mono text-center">
          <div className="rounded border border-slate-200 bg-white p-2">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-0.5">
              <ThumbsUp className="h-3 w-3 text-slate-400" />
              <span>Likes</span>
            </div>
            <span className="text-sm font-semibold text-slate-800 tabular-nums">
              {post.engagement.likes.toLocaleString()}
            </span>
          </div>
          <div className="rounded border border-slate-200 bg-white p-2">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-0.5">
              <Repeat className="h-3 w-3 text-slate-400" />
              <span>Reposts</span>
            </div>
            <span className="text-sm font-semibold text-slate-800 tabular-nums">
              {post.engagement.reposts.toLocaleString()}
            </span>
          </div>
          <div className="rounded border border-slate-200 bg-white p-2">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-0.5">
              <MessageSquare className="h-3 w-3 text-slate-400" />
              <span>Comments</span>
            </div>
            <span className="text-sm font-semibold text-slate-800 tabular-nums">
              {post.engagement.comments.toLocaleString()}
            </span>
          </div>
          <div className="rounded border border-slate-200 bg-white p-2">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-0.5">
              <Eye className="h-3 w-3 text-slate-400" />
              <span>Views</span>
            </div>
            <span className="text-sm font-semibold text-slate-800 tabular-nums">
              {post.engagement.views.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Transparent NLP Diagnostics */}
        <div className="rounded border border-slate-200 bg-slate-50 p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="h-3.5 w-3.5 text-slate-600" />
              <span>Transparent Lexical Classifier Inspection</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Confidence: {Math.round(post.sentimentConfidence * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-mono">Assigned Sentiment</span>
              <span
                className={`font-semibold capitalize ${
                  post.sentiment === 'positive'
                    ? 'text-emerald-700'
                    : post.sentiment === 'negative'
                    ? 'text-rose-700'
                    : 'text-slate-700'
                }`}
              >
                {post.sentiment} (Score: {post.sentimentScore})
              </span>
            </div>

            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-mono">Dominant Emotion</span>
              <span className="font-semibold capitalize text-amber-800">{post.emotion}</span>
            </div>

            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-mono">Relationship</span>
              <span className="font-semibold capitalize text-slate-700">
                {post.relationship} {post.parentEventId ? `-> ${post.parentEventId}` : ''}
              </span>
            </div>
          </div>

          {/* Lexicon Term Matches */}
          <div className="pt-1 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-start gap-2">
              <span className="font-mono text-emerald-700 font-medium shrink-0">+ Positive Lexicon:</span>
              <span>
                {classification.detectedPositiveTerms.length > 0
                  ? classification.detectedPositiveTerms.map((t) => `${t.word} (+${t.weight})`).join(', ')
                  : 'None'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-rose-700 font-medium shrink-0">- Negative Lexicon:</span>
              <span>
                {classification.detectedNegativeTerms.length > 0
                  ? classification.detectedNegativeTerms.map((t) => `${t.word} (${t.weight})`).join(', ')
                  : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Ledger Provenance */}
        <div className="rounded border border-slate-200 bg-white p-3 mb-5 text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span className="flex items-center gap-1.5">
              {post.tampered ? (
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              )}
              <span>Cryptographic Provenance Record</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                post.tampered
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {post.tampered ? 'TAMPERING DETECTED' : 'LEDGER VERIFIED'}
            </span>
          </div>

          <div className="text-slate-600 break-all">
            <span className="text-slate-400">Record Hash (SHA-256): </span>
            <span className="text-slate-800 font-semibold">{post.evidenceHash}</span>
          </div>
          <div className="text-slate-600 break-all">
            <span className="text-slate-400">Previous Link Hash: </span>
            <span className="text-slate-600">{post.previousHash}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            onClick={() => setSelectedPostForModal(null)}
            className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              const topic = post.topic;
              setSelectedPostForModal(null);
              launchInvestigationForTopic(topic);
            }}
            className="flex items-center gap-1.5 rounded bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-white transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Launch Narrative Investigation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
