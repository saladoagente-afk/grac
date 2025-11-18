import React from 'react';

interface Props {
  title: string;
  icon?: string;
}

export const FormSectionTitle: React.FC<Props> = ({ title, icon }) => (
  <div className="border-b-2 border-gray-200 pb-2 mb-4 mt-6 flex items-center gap-2">
    {icon && <i className={`fa-solid ${icon} text-blue-600`}></i>}
    <h3 className="text-lg font-semibold text-gray-700 uppercase">{title}</h3>
  </div>
);