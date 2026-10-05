// src/suites/archive/components/explorer/ArchiveExplorer.tsx
import React, { useRef } from 'react';
import { useArchiveStore } from '../../store/archiveStore';
import { formatBytes } from '../../../../lib/fileUtils';
import {
  Folder,
  FileText,
  FileCode,
  FileArchive,
  Image,
  File,
  ChevronRight,
  ArrowUp,
  Download,
  Eye,
  Trash2,
  FolderPlus,
  Upload,
  CheckSquare,
  Square,
  AlertTriangle,
  ShieldCheck,
  Search,
  Grid,
  List
} from 'lucide-react';
import { ArchiveItem } from '../../store/types';

export const ArchiveExplorer: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const items = useArchiveStore((s) => s.items);
  const currentPath = useArchiveStore((s) => s.currentPath);
  const setCurrentPath = useArchiveStore((s) => s.setCurrentPath);
  const selectedItemIds = useArchiveStore((s) => s.selectedItemIds);
  const toggleSelectItem = useArchiveStore((s) => s.toggleSelectItem);
  const selectAll = useArchiveStore((s) => s.selectAll);
  const clearSelection = useArchiveStore((s) => s.clearSelection);
  const searchQuery = useArchiveStore((s) => s.searchQuery);
  const setSearchQuery = useArchiveStore((s) => s.setSearchQuery);
  const sortBy = useArchiveStore((s) => s.sortBy);
  const sortAscending = useArchiveStore((s) => s.sortAscending);
  const setSortBy = useArchiveStore((s) => s.setSortBy);
  const viewMode = useArchiveStore((s) => s.viewMode);
  const setViewMode = useArchiveStore((s) => s.setViewMode);

  const addFilesToArchive = useArchiveStore((s) => s.addFilesToArchive);
  const createVirtualFolder = useArchiveStore((s) => s.createVirtualFolder);
  const deleteSelectedItems = useArchiveStore((s) => s.deleteSelectedItems);
  const openPreview = useArchiveStore((s) => s.openPreview);
  const extractSingleItem = useArchiveStore((s) => s.extractSingleItem);

  // Compute items inside current folder or filtered by search query
  const displayedItems = items
    .filter((item) => {
      if (searchQuery.trim()) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.path.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return item.parentPath === currentPath;
    })
    .sort((a, b) => {
      // Folders always first
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;

      let compare = 0;
      if (sortBy === 'name') {
        compare = a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        compare = a.size - b.size;
      } else if (sortBy === 'compressedSize') {
        compare = a.compressedSize - b.compressedSize;
      } else if (sortBy === 'date') {
        compare = a.modified.getTime() - b.modified.getTime();
      } else if (sortBy === 'ratio') {
        const ratioA = a.size > 0 ? (1 - a.compressedSize / a.size) : 0;
        const ratioB = b.size > 0 ? (1 - b.compressedSize / b.size) : 0;
        compare = ratioA - ratioB;
      }
      return sortAscending ? compare : -compare;
    });

  // Breadcrumbs navigation segments
  const pathSegments = currentPath ? currentPath.split('/') : [];

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentPath('');
    } else {
      const target = pathSegments.slice(0, index + 1).join('/');
      setCurrentPath(target);
    }
  };

  const handleGoUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const handleItemDoubleClick = (item: ArchiveItem) => {
    if (item.isDirectory) {
      const clean = item.path.replace(/\/$/, '');
      setCurrentPath(clean);
    } else {
      openPreview(item);
    }
  };

  const handleCreateFolder = () => {
    const name = prompt('Enter new virtual folder name:', 'New_Folder');
    if (name) createVirtualFolder(name);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToArchive(Array.from(e.target.files));
    }
  };

  const getItemIcon = (item: ArchiveItem) => {
    if (item.isDirectory) {
      return <Folder className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    const lower = item.name.toLowerCase();
    if (lower.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
      return <Image className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (lower.match(/\.(zip|tar|gz|7z|rar|bz2|xz)$/)) {
      return <FileArchive className="w-4 h-4 text-orange-400 shrink-0" />;
    }
    if (lower.match(/\.(ts|js|jsx|tsx|json|html|css|py|rs|go|c|cpp)$/)) {
      return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
    if (lower.match(/\.(md|txt|pdf|doc|docx)$/)) {
      return <FileText className="w-4 h-4 text-blue-400 shrink-0" />;
    }
    return <File className="w-4 h-4 text-zinc-400 shrink-0" />;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090A0F] overflow-hidden select-none border-r border-white/5">
      {/* 1. EXPLORER TOP ACTION BAR */}
      <div className="h-11 bg-[#0F111A] border-b border-white/[0.06] px-3 flex items-center justify-between gap-3 shrink-0">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto py-1 scrollbar-none flex-1">
          <button
            onClick={handleGoUp}
            disabled={!currentPath}
            className={`p-1 rounded transition-colors ${
              currentPath
                ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Go to parent directory"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className={`px-1.5 py-0.5 rounded transition-colors font-mono ${
              !currentPath ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-zinc-400 hover:text-white'
            }`}
          >
            root/
          </button>

          {pathSegments.map((segment, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                className={`px-1.5 py-0.5 rounded transition-colors font-mono truncate max-w-[140px] ${
                  idx === pathSegments.length - 1
                    ? 'text-amber-400 font-bold bg-amber-500/10'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {segment}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Action Buttons: Add, New Folder, Delete */}
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            multiple
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs transition-colors"
            title="Add files to current folder"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">Add</span>
          </button>

          <button
            onClick={handleCreateFolder}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/[0.04] hover:bg-white/10 text-zinc-300 border border-white/10 text-xs transition-colors"
            title="Create virtual folder"
          >
            <FolderPlus className="w-3 h-3" />
            <span className="hidden sm:inline">Folder</span>
          </button>

          {selectedItemIds.size > 0 && (
            <button
              onClick={deleteSelectedItems}
              className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs transition-colors"
              title={`Delete ${selectedItemIds.size} selected item(s)`}
            >
              <Trash2 className="w-3 h-3" />
              <span>{selectedItemIds.size}</span>
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/5 ml-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & SELECTION SUB-HEADER */}
      <div className="h-9 bg-[#0C0E14] border-b border-white/[0.04] px-3 flex items-center justify-between gap-3 text-xs text-zinc-400 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter by filename, extension..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <button
            onClick={() => (selectedItemIds.size > 0 ? clearSelection() : selectAll())}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            {selectedItemIds.size > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            <span>{selectedItemIds.size} selected</span>
          </button>
          <span className="text-zinc-600">|</span>
          <span>{displayedItems.length} items</span>
        </div>
      </div>

      {/* 3. TABLE HEADER (When in List View) */}
      {viewMode === 'list' && (
        <div className="h-7 bg-[#0E1018] border-b border-white/[0.04] px-3 grid grid-cols-12 gap-2 items-center text-[11px] font-mono text-zinc-500 shrink-0">
          <div
            className="col-span-6 flex items-center gap-1 cursor-pointer hover:text-zinc-300"
            onClick={() => setSortBy('name')}
          >
            <span>NAME</span>
            {sortBy === 'name' && <span>{sortAscending ? '▲' : '▼'}</span>}
          </div>
          <div
            className="col-span-2 text-right cursor-pointer hover:text-zinc-300"
            onClick={() => setSortBy('size')}
          >
            <span>SIZE</span>
            {sortBy === 'size' && <span>{sortAscending ? '▲' : '▼'}</span>}
          </div>
          <div
            className="col-span-2 text-right cursor-pointer hover:text-zinc-300 hidden md:block"
            onClick={() => setSortBy('compressedSize')}
          >
            <span>PACKED</span>
            {sortBy === 'compressedSize' && <span>{sortAscending ? '▲' : '▼'}</span>}
          </div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>
      )}

      {/* 4. MAIN CONTENT VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {displayedItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
            <FolderPlus className="w-10 h-10 mb-2 opacity-30 text-amber-400" />
            <p className="text-sm font-medium text-zinc-400">Empty directory</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs">
              Drop files here or click "Add" to package items client-side into this folder.
            </p>
          </div>
        ) : viewMode === 'list' ? (
          // LIST VIEW
          <div className="space-y-0.5">
            {displayedItems.map((item) => {
              const isSelected = selectedItemIds.has(item.id);
              const ratio = item.size > 0 ? Math.round((1 - item.compressedSize / item.size) * 100) : 0;

              return (
                <div
                  key={item.id}
                  onClick={(e) => toggleSelectItem(item.id, e.ctrlKey || e.metaKey)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className={`h-9 px-3 rounded grid grid-cols-12 gap-2 items-center text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/30 text-white'
                      : 'hover:bg-white/[0.04] text-zinc-300 border border-transparent'
                  }`}
                >
                  {/* Name + Icon */}
                  <div className="col-span-6 flex items-center gap-2 truncate">
                    {getItemIcon(item)}
                    <span className="truncate font-medium">{item.name}</span>
                    {item.isSafe === false && (
                      <span title={item.securityNotice || 'Zip Slip risk'}>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      </span>
                    )}
                  </div>

                  {/* Uncompressed Size */}
                  <div className="col-span-2 text-right font-mono text-[11px] text-zinc-400">
                    {item.isDirectory ? '-' : formatBytes(item.size)}
                  </div>

                  {/* Compressed Size + Ratio */}
                  <div className="col-span-2 text-right font-mono text-[11px] text-zinc-500 hidden md:flex items-center justify-end gap-1.5">
                    {item.isDirectory ? (
                      '-'
                    ) : (
                      <>
                        <span>{formatBytes(item.compressedSize)}</span>
                        {ratio > 0 && (
                          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1 rounded">
                            -{ratio}%
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    {!item.isDirectory && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPreview(item);
                          }}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
                          title="Preview Content"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            extractSingleItem(item);
                          }}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-amber-400"
                          title="Extract to Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // GRID VIEW
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {displayedItems.map((item) => {
              const isSelected = selectedItemIds.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={(e) => toggleSelectItem(item.id, e.ctrlKey || e.metaKey)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className={`p-3 rounded-lg border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/40 text-white'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-zinc-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center">
                    {getItemIcon(item)}
                  </div>
                  <span className="text-xs font-medium truncate w-full" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {item.isDirectory ? 'Directory' : formatBytes(item.size)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
