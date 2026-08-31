"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface SocialTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSaveSettings: () => void;
  loading: boolean;
  renderSaveButton?: (onSave: () => void, isLoading: boolean) => React.ReactNode;
}

export default function SocialTab({
  formData,
  setFormData,
  handleSaveSettings,
  loading,
  renderSaveButton,
}: SocialTabProps) {
  // Slider Hero Button switch state (লোকাল স্টেট হিসেবে সরিয়ে আনা হয়েছে)
  const [activeHeroBtnTab, setActiveHeroBtnTab] = useState<"btn1" | "btn2">("btn1");

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. SOCIAL & CONTACT INFORMATION */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          1. Social & Floating Button
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              WhatsApp Number
            </Label>
            <Input
              value={formData.whatsappNumber || ""}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="e.g. 88017XXXXXXXX"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Telegram Username
            </Label>
            <Input
              value={formData.telegramUsername || ""}
              onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
              placeholder="e.g. https://t.me/onlyusername"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              YouTube Link
            </Label>
            <Input
              value={formData.youtubeLink || ""}
              onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
              placeholder="https://youtube.com/c/YourChannel"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Facebook Link
            </Label>
            <Input
              value={formData.facebookLink || ""}
              onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
              placeholder="https://facebook.com/YourPage"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Instagram Link
            </Label>
            <Input
              value={formData.instagramLink || ""}
              onChange={(e) => setFormData({ ...formData, instagramLink: e.target.value })}
              placeholder="https://instagram.com/YourPage"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Active Floating Button
            </Label>
            <select
              value={formData.activeFloatingButton || "WHATSAPP"}
              onChange={(e) =>
                setFormData({ ...formData, activeFloatingButton: e.target.value as any })
              }
              className="flex h-11 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 dark:bg-neutral-950 focus:outline-none"
            >
              <option value="WHATSAPP">WhatsApp</option>
              <option value="TELEGRAM">Telegram</option>
              <option value="YOUTUBE">YouTube</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. SLIDER BOTTOM BUTTONS */}
      <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
          2. Slider Bottom Buttons
        </h3>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveHeroBtnTab("btn1")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeHeroBtnTab === "btn1"
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            }`}
          >
            Slider Button 1
          </button>
          <button
            type="button"
            onClick={() => setActiveHeroBtnTab("btn2")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeHeroBtnTab === "btn2"
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            }`}
          >
            Slider Button 2
          </button>
        </div>

        {/* BUTTON 1 CONTENT */}
        {activeHeroBtnTab === "btn1" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                ENABLE SLIDER BUTTON 1
              </Label>
              <Switch
                checked={formData.isHeroBtn1Visible || false}
                onCheckedChange={(v) => setFormData({ ...formData, isHeroBtn1Visible: v })}
              />
            </div>

            {formData.isHeroBtn1Visible && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Subtitle
                    </Label>
                    <Input
                      value={formData.heroBtn1Subtitle || ""}
                      onChange={(e) => setFormData({ ...formData, heroBtn1Subtitle: e.target.value })}
                      placeholder="e.g. SUPPORT"
                      className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Title
                    </Label>
                    <Input
                      value={formData.heroBtn1Title || ""}
                      onChange={(e) => setFormData({ ...formData, heroBtn1Title: e.target.value })}
                      placeholder="e.g. Telegram"
                      className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Redirect Link
                    </Label>
                    <Input
                      value={formData.heroBtn1Link || ""}
                      onChange={(e) => setFormData({ ...formData, heroBtn1Link: e.target.value })}
                      placeholder="https://t.me/yourchannel"
                      className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      RAW SVG ICON
                    </Label>
                    <Textarea
                      value={formData.heroBtn1Svg || ""}
                      onChange={(e) => setFormData({ ...formData, heroBtn1Svg: e.target.value })}
                      placeholder="Paste raw <svg>...</svg> code here"
                      className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 min-h-[90px] font-mono text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BUTTON 2 CONTENT */}
        {activeHeroBtnTab === "btn2" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                ENABLE SLIDER BUTTON 2
              </Label>
              <Switch
                checked={formData.isHeroBtn2Visible || false}
                onCheckedChange={(v) => setFormData({ ...formData, isHeroBtn2Visible: v })}
              />
            </div>

            {formData.isHeroBtn2Visible && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Subtitle
                    </Label>
                    <Input
                      value={formData.heroBtn2Subtitle || ""}
                      onChange={(e) => setFormData({ ...formData, heroBtn2Subtitle: e.target.value })}
                      placeholder="e.g. GROUP"
                      className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Title
                    </Label>
                    <Input
                      value={formData.heroBtn2Title || ""}
                      onChange={(e) => setFormData({ ...formData, heroBtn2Title: e.target.value })}
                      placeholder="e.g. Telegram"
                      className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Redirect Link
                    </Label>
                    <Input
                      value={formData.heroBtn2Link || ""}
                      onChange={(e) => setFormData({ ...formData, heroBtn2Link: e.target.value })}
                      placeholder="https://t.me/yourgroup"
                      className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      RAW SVG ICON
                    </Label>
                    <Textarea
                      value={formData.heroBtn2Svg || ""}
                      onChange={(e) => setFormData({ ...formData, heroBtn2Svg: e.target.value })}
                      placeholder="Paste raw <svg>...</svg> code here"
                      className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 min-h-[90px] font-mono text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          {renderSaveButton ? (
            renderSaveButton(handleSaveSettings, loading)
          ) : (
            <Button onClick={handleSaveSettings} disabled={loading} className="rounded-xl">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}