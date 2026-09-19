import React from 'react';

/**
 * LogoMark: Dynamic SVG Vector of the Let's Cook Monogram ("LC")
 * - Scalable vector with transparent background.
 * - Contrast-optimized for both Dark and Light themes:
 *   - Dark theme: Stem is 100% luminous white (#ffffff), Accent is electric crimson (#ff2a6d).
 *   - Light theme: Stem is deep obsidian (#111114), Accent is vivid ruby crimson (#e11d48).
 *   - Protected by dual-stage drop shadows to prevent merging into any backdrop.
 */
export default function LogoMark({ className = '', style = {}, size = 36, ...props }) {
  return (
    <svg 
      viewBox="0 0 675 435" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`logo-mark-svg ${className}`}
      style={{
        height: size ? `${size}px` : 'auto',
        width: 'auto',
        aspectRatio: '675 / 435',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
      aria-label="Let's Cook Logo"
      {...props}
    >
      {/* Theme-Adaptive Upper Arc, Stem & Center Circuit (white in dark mode, obsidian in light mode) */}
      <path 
        className="logo-mark-stem"
        d="M 671 263 L 670 251 L 664 239 L 658 233 L 644 227 L 631 227 L 618 233 L 611 240 L 606 251 L 344 257 L 340 259 L 341 263 L 344 264 L 474 267 L 605 268 L 607 270 L 607 273 L 610 279 L 619 288 L 631 293 L 645 293 L 658 287 L 666 278 L 669 272 Z M 636 241 L 640 241 L 644 242 L 648 244 L 654 250 L 655 252 L 656 255 L 657 261 L 656 265 L 653 271 L 649 275 L 646 277 L 644 278 L 640 279 L 635 279 L 632 278 L 628 276 L 622 270 L 620 266 L 619 263 L 619 257 L 620 253 L 621 251 L 628 244 L 632 242 Z M 469 151 L 447 128 L 421 109 L 392 95 L 359 86 L 317 84 L 295 87 L 258 98 L 234 110 L 207 129 L 186 150 L 165 180 L 152 208 L 143 243 L 142 274 L 148 306 L 157 329 L 236 329 L 224 312 L 214 286 L 212 275 L 212 251 L 214 240 L 220 222 L 236 196 L 254 178 L 277 163 L 298 155 L 312 152 L 347 152 L 365 156 L 387 166 L 403 177 L 413 187 L 428 187 Z M 93 7 L 4 80 L 4 423 L 230 423 L 212 414 L 184 393 L 163 371 L 149 351 L 93 350 Z" 
        fillRule="evenodd" 
      />
      {/* High-Contrast Luminous Crimson Circuit Branches & Lower Arc */}
      <path 
        className="logo-mark-accent"
        d="M 449 353 L 394 312 L 378 327 L 361 339 L 344 347 L 321 353 L 297 354 L 279 352 L 273 350 L 170 350 L 179 363 L 194 379 L 209 391 L 228 403 L 240 409 L 266 418 L 280 421 L 299 423 L 317 423 L 336 421 L 360 415 L 378 408 L 394 400 L 415 386 L 426 377 Z M 405 296 L 416 305 L 431 315 L 504 316 L 517 338 L 523 346 L 525 351 L 529 356 L 553 357 L 554 362 L 560 371 L 568 377 L 573 379 L 578 380 L 587 380 L 599 376 L 608 368 L 612 361 L 614 355 L 614 344 L 612 337 L 609 331 L 603 324 L 592 318 L 587 317 L 578 317 L 571 319 L 565 322 L 557 330 L 554 338 L 552 340 L 540 340 L 537 337 L 514 298 L 512 296 L 497 297 L 486 296 L 465 296 L 458 297 Z M 578 332 L 587 332 L 590 333 L 592 334 L 597 339 L 599 342 L 600 345 L 600 353 L 597 359 L 593 363 L 589 365 L 586 366 L 580 366 L 577 365 L 573 363 L 569 359 L 567 356 L 566 353 L 566 344 L 568 340 L 574 334 Z M 654 162 L 649 151 L 638 141 L 630 138 L 616 138 L 606 142 L 597 151 L 591 163 L 533 164 L 506 205 L 407 206 L 396 194 L 387 187 L 361 174 L 331 169 L 316 170 L 314 171 L 314 224 L 512 225 L 514 224 L 540 184 L 544 180 L 594 181 L 598 190 L 606 197 L 616 201 L 629 201 L 641 196 L 650 186 L 654 177 Z M 621 152 L 625 152 L 629 153 L 631 154 L 634 156 L 637 159 L 640 165 L 640 174 L 637 180 L 633 184 L 629 186 L 626 187 L 619 187 L 616 186 L 614 185 L 607 178 L 606 175 L 606 164 L 607 162 L 609 159 L 612 156 L 615 154 L 617 153 Z" 
        fillRule="evenodd" 
      />
    </svg>
  );
}
