"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { Trash2, Save, X, Check } from "lucide-react";
import DragIndicator from "./drag-indicator";

export default function SortableQuestion({
  field,
  index,
  update,
  remove,
}: {
  field: {
    id: string;
    question: string;
    options: string[];
    answer: string;
    points: number;
  };
  index: number;
  update: (index: number, value: {
    id: string;
    question: string;
    options: string[];
    answer: string;
    points: number;
  }) => void;
  remove: (index: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(field);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  const handleOptionChange = (optionIdx: number, value: string) => {
    const newOptions = [...editedQuestion.options];
    newOptions[optionIdx] = value;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const handleSave = () => {
    update(index, editedQuestion);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, touchAction: "manipulation" }}
      className={`mb-4 ${
        transform ? "opacity-75 scale-105 z-10" : "opacity-100"
      }`}
    >
      <div className="bg-white shadow-sm border border-red-100 rounded-xl overflow-hidden">
        <div className="p-4 border-red-100 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="touch-manipulation cursor-grab"
                style={{ touchAction: "none" }}
              >
                <DragIndicator />
              </div>
              <h3 className="font-semibold text-base">
                Question {index + 1}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
              <button
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div>
          <div
            className="hover:bg-red-50 p-4 transition-colors cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isEditing ? "Edit Question" : field.question || "Nouvelle question"}
          </div>
          {(isExpanded || isEditing) && (
            <div className="p-4 border-red-100 border-t">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">
                      Question
                    </label>
                    <textarea
                      className="p-2 border border-gray-300 focus:border-red-500 rounded-lg focus:outline-none focus:ring-red-500 w-full"
                      value={editedQuestion.question}
                      onChange={e => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                      placeholder="Entrez la question"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">
                      Options
                    </label>
                    {editedQuestion.options.map((option: string, optionIdx: number) => (
                      <div key={optionIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 p-2 border border-gray-300 focus:border-red-500 rounded-lg focus:outline-none focus:ring-red-500"
                          value={option}
                          onChange={e => handleOptionChange(optionIdx, e.target.value)}
                          placeholder={`Option ${optionIdx + 1}`}
                        />
                        <div
                          className={`h-5 w-5 rounded-full border ${editedQuestion.answer === option ? "bg-red-500 border-red-500" : "border-gray-300"} flex items-center justify-center cursor-pointer`}
                          onClick={() => setEditedQuestion({ ...editedQuestion, answer: option })}
                        >
                          {editedQuestion.answer === option && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">
                      Points
                    </label>
                    <select
                      className="p-2 border border-gray-300 focus:border-red-500 rounded-lg focus:outline-none focus:ring-red-500"
                      value={editedQuestion.points}
                      onChange={e => setEditedQuestion({ ...editedQuestion, points: Number.parseInt(e.target.value) })}
                    >
                      <option value={1}>1 Point</option>
                      <option value={2}>2 Points</option>
                      <option value={3}>3 Points</option>
                      <option value={4}>4 Points</option>
                      <option value={5}>5 Points</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {field.options.map((option: string, optionIdx: number) => (
                      <div key={optionIdx} className="flex items-center space-x-2">
                        <div
                          className={`h-5 w-5 rounded-full border ${option === field.answer ? "bg-red-500 border-red-500" : "border-gray-300"} flex items-center justify-center`}
                        >
                          {option === field.answer && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <label className="text-sm">{option}</label>
                      </div>
                    ))}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Points: {field.points}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
