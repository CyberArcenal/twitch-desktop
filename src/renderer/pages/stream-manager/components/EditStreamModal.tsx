import React, { useState, useEffect } from "react";
import { Search, X, Plus, Info } from "lucide-react";
import { gamesAPI } from "../../../api/core/games";
import type { StreamInfo } from "../hooks/useStreamInfo";

interface EditStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  info: StreamInfo;
  updateField: (field: keyof StreamInfo, value: any) => void;
  onSave: () => void;
  channelName: string;
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "it", name: "Italiano" },
];

const EditStreamModal: React.FC<EditStreamModalProps> = ({
  isOpen,
  onClose,
  info,
  updateField,
  onSave,
  channelName,
}) => {
  const [tagInput, setTagInput] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [goLiveMessage, setGoLiveMessage] = useState(
    `${channelName} went live!`,
  );

  const titleCharCount = info.title.length;
  const maxTitleChars = 140;

  // Search categories
  useEffect(() => {
    const search = async () => {
      if (!categorySearch.trim()) {
        setSearchResults([]);
        return;
      }
      const res = await gamesAPI.searchCategories(categorySearch);
      if (res.status && res.data) {
        setSearchResults(res.data);
      }
    };
    const timeout = setTimeout(search, 500);
    return () => clearTimeout(timeout);
  }, [categorySearch]);

  const selectCategory = (game: any) => {
    updateField("game_id", game.id);
    updateField("game_name", game.name);
    setCategorySearch(game.name);
    setShowSearch(false);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    if (tag.length > 25) {
      alert("Tag must be 25 characters or less");
      return;
    }
    if (info.tags.length >= 10) {
      alert("Maximum 10 tags allowed");
      return;
    }
    if (!info.tags.includes(tag)) {
      updateField("tags", [...info.tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    updateField(
      "tags",
      info.tags.filter((t) => t !== tag),
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#1f1f23] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1f1f23] border-b border-[#2a2a2e] p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Edit Stream Info</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2a2a2e] rounded-lg"
          >
            <X className="w-5 h-5 text-[#adadb8]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-white font-medium mb-2">Title</label>
            <textarea
              value={info.title}
              onChange={(e) => updateField("title", e.target.value)}
              maxLength={maxTitleChars}
              rows={3}
              className="w-full bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-4 py-2 text-white resize-none"
              placeholder="What are you playing or doing?"
            />
            <div className="text-right text-sm text-[#adadb8] mt-1">
              {titleCharCount}/{maxTitleChars}
            </div>
          </div>

          {/* Go Live Notification */}
          <div className="border border-[#2a2a2e] rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-medium">Go Live Notification</h3>
                <p className="text-sm text-[#adadb8]">
                  Your followers will see this when you go live.
                </p>
              </div>
              <button className="text-[#9147ff] text-sm hover:underline">
                Learn More
              </button>
            </div>
            <div className="bg-[#0e0e10] rounded-lg p-3">
              <textarea
                value={info.go_live_notification}
                onChange={(e) => updateField("go_live_notification", e.target.value)}
                maxLength={140}
                rows={2}
                className="w-full bg-transparent text-white resize-none focus:outline-none"
                placeholder="Customize your go live notification"
              />
              <div className="text-right text-sm text-[#adadb8] mt-2">
                {info.go_live_notification.length}/140
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-white font-medium mb-2">
              Category
            </label>
            <div className="relative">
              <input
                type="text"
                value={categorySearch || info.game_name}
                onChange={(e) => {
                  setCategorySearch(e.target.value);
                  setShowSearch(true);
                  if (!e.target.value) updateField("game_id", "");
                }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search for a category"
                className="w-full bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-4 py-2 text-white"
              />
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1f1f23] border border-[#2a2a2e] rounded-lg max-h-60 overflow-y-auto z-10">
                  {searchResults.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => selectCategory(game)}
                      className="w-full text-left px-4 py-2 hover:bg-[#2a2a2e] text-white"
                    >
                      {game.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-white font-medium">Tags</label>
              <button className="text-[#9147ff] text-sm hover:underline">
                Learn More
              </button>
            </div>
            <p className="text-sm text-[#adadb8] mb-3">
              Add tags to help viewers find you. Share more about your stream
              and get discovered.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {info.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#2a2a2e] text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="Use Enter after each tag"
                className="flex-1 bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-4 py-2 text-white"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-[#9147ff] rounded-lg hover:bg-[#772ce8]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right text-sm text-[#adadb8] mt-1">
              {info.tags.length}/10 tags &nbsp;|&nbsp; Each tag max 25
              characters
            </div>
          </div>

          {/* Stream Language */}
          <div>
            <label className="block text-white font-medium mb-2">
              Stream Language
            </label>
            <select
              value={info.broadcaster_language}
              onChange={(e) =>
                updateField("broadcaster_language", e.target.value)
              }
              className="w-full bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-4 py-2 text-white"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Classification */}
          <div className="border border-[#2a2a2e] rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-medium">Content Classification</h3>
              <button className="text-[#9147ff] text-sm hover:underline">
                Learn More
              </button>
            </div>
            <p className="text-sm text-[#adadb8] mb-3">
              You are required to disclose if your content is not suitable for
              certain viewers.
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={info.content_classification_labels.includes(
                    "MatureGame",
                  )}
                  onChange={(e) => {
                    const labels = e.target.checked
                      ? [...info.content_classification_labels, "MatureGame"]
                      : info.content_classification_labels.filter(
                          (l) => l !== "MatureGame",
                        );
                    updateField("content_classification_labels", labels);
                  }}
                  className="rounded"
                />
                Mature-Rated Game
              </label>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={info.content_classification_labels.includes(
                    "SexualThemes",
                  )}
                  onChange={(e) => {
                    const labels = e.target.checked
                      ? [...info.content_classification_labels, "SexualThemes"]
                      : info.content_classification_labels.filter(
                          (l) => l !== "SexualThemes",
                        );
                    updateField("content_classification_labels", labels);
                  }}
                  className="rounded"
                />
                Sexual Themes
              </label>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={info.content_classification_labels.includes(
                    "ViolenceGore",
                  )}
                  onChange={(e) => {
                    const labels = e.target.checked
                      ? [...info.content_classification_labels, "ViolenceGore"]
                      : info.content_classification_labels.filter(
                          (l) => l !== "ViolenceGore",
                        );
                    updateField("content_classification_labels", labels);
                  }}
                  className="rounded"
                />
                Violent & Graphic Content
              </label>
            </div>
          </div>

          {/* Rerun */}
          <div className="flex justify-between items-center p-4 border border-[#2a2a2e] rounded-lg">
            <div>
              <h3 className="text-white font-medium">Rerun</h3>
              <p className="text-sm text-[#adadb8]">
                Let viewers know your stream was previously recorded. Failure to
                label Reruns leads to viewer confusion.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={info.is_rerun}
                onChange={(e) => updateField("is_rerun", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2a2a2e] rounded-full peer peer-checked:bg-[#9147ff] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          {/* Branded Content */}
          <div className="flex justify-between items-center p-4 border border-[#2a2a2e] rounded-lg">
            <div>
              <h3 className="text-white font-medium">Branded Content</h3>
              <p className="text-sm text-[#adadb8]">
                Let viewers know if your stream features branded content. This
                includes paid product placement, endorsement, or other
                commercial relationships.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={info.is_branded_content}
                onChange={(e) =>
                  updateField("is_branded_content", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2a2a2e] rounded-full peer peer-checked:bg-[#9147ff] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="sticky bottom-0 bg-[#1f1f23] border-t border-[#2a2a2e] p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2a2a2e] rounded-lg hover:bg-[#3a3a4a]"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-[#9147ff] rounded-lg hover:bg-[#772ce8]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStreamModal;
