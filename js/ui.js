/**
 * UI Module - Handles user interface rendering and interactions
 * 
 * This module provides utilities for drawing UI elements, menus, and overlays.
 * It's designed to work with the GameRenderer system for consistent rendering.
 * 
 * @module UI
 */

/**
 * Draw heads-up display elements
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} gameData - Game data object containing player info, stats, etc.
 */
export function drawHUD(ctx, gameData) {
    // Implementation would go here for HUD rendering
    // This is kept minimal as most UI is handled by GameRenderer
}

/**
 * Draw menu overlays and dialogs  
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} menuData - Menu configuration and state
 */
export function drawMenuOverlay(ctx, menuData) {
    // Implementation would go here for menu overlays
    // This is kept minimal as most menu rendering is handled by GameRenderer
}

/**
 * Legacy UI drawing function - maintained for compatibility
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @deprecated Use GameRenderer system instead
 */
export function drawUI(ctx) {
    // Legacy function - most UI is now handled by GameRenderer system
    // This is kept for backwards compatibility
}

/**
 * Utility function to draw text with outline
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context  
 * @param {string} text - Text to draw
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} fillColor - Fill color
 * @param {string} strokeColor - Stroke color
 * @param {number} strokeWidth - Stroke width
 */
export function drawOutlinedText(ctx, text, x, y, fillColor = '#fff', strokeColor = '#000', strokeWidth = 2) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.strokeText(text, x, y);
    
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);
}