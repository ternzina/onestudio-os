"use client";

import { forwardRef } from "react";
import type { IconType } from "react-icons";
import {
  FaDribbble,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import type { LucideIcon, LucideProps } from "lucide-react";

function createBrandIcon(Icon: IconType): LucideIcon {
  return forwardRef<SVGSVGElement, LucideProps>(
    ({ absoluteStrokeWidth: _absoluteStrokeWidth, strokeWidth: _strokeWidth, ...props }, _ref) =>
      <Icon {...props} />,
  );
}

export const Github = createBrandIcon(FaGithub);
export const Instagram = createBrandIcon(FaInstagram);
export const Linkedin = createBrandIcon(FaLinkedinIn);
export const Youtube = createBrandIcon(FaYoutube);
export const Twitter = createBrandIcon(FaTwitter);
export const Dribbble = createBrandIcon(FaDribbble);
