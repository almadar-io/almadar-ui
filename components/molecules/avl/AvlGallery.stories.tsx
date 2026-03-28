import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AvlApplication,
  AvlOrbital,
  AvlEntity,
  AvlTrait,
  AvlPage,
  AvlState,
  AvlTransition,
  AvlEvent,
  AvlGuard,
  AvlEffect,
  AvlField,
  AvlFieldType,
  AvlBinding,
  AvlPersistence,
  AvlOperator,
  AvlSExpr,
  AvlLiteral,
  AvlBindingRef,
} from '../../atoms/avl';

const Gallery: React.FC<{ color?: string }> = ({ color: _color }) => {
  const color = 'var(--color-primary)';

  return (
    <div style={{ width: 500 }}>
      <svg viewBox="0 0 800 900" xmlns="http://www.w3.org/2000/svg">
        {/* Section: Tier 1 - Structural */}
        <text x={400} y={30} textAnchor="middle" fill={color} fontSize={16} fontFamily="inherit" fontWeight="bold">
          Tier 1: Structural
        </text>

        {/* Row 1 */}
        <AvlApplication x={10} y={50} width={100} height={70} label="App" color={color} />
        <AvlOrbital cx={230} cy={90} r={40} label="Orbital" color={color} />
        <AvlEntity x={380} y={90} r={20} fieldCount={4} color={color} />
        <text x={380} y={130} textAnchor="middle" fill={color} fontSize={9} fontFamily="inherit" opacity={0.7}>Entity</text>
        <AvlTrait cx={530} cy={90} rx={50} ry={20} label="Trait" color={color} />
        <AvlPage x={680} y={90} size={14} label="/page" color={color} />

        {/* Section: Tier 2 - Behavioral */}
        <text x={400} y={200} textAnchor="middle" fill={color} fontSize={16} fontFamily="inherit" fontWeight="bold">
          Tier 2: Behavioral
        </text>

        {/* Row 2 */}
        <AvlState x={30} y={230} width={80} height={32} name="State" color={color} />
        <AvlTransition x1={200} y1={250} x2={280} y2={250} label="trans" color={color} />
        <AvlEvent x={380} y={250} size={16} label="Event" color={color} />
        <AvlGuard x={530} y={250} size={24} label="guard?" color={color} />
        <AvlEffect x={680} y={250} effectType="render-ui" size={10} label="render-ui" color={color} />

        {/* Section: Tier 3 - Data */}
        <text x={400} y={380} textAnchor="middle" fill={color} fontSize={16} fontFamily="inherit" fontWeight="bold">
          Tier 3: Data
        </text>

        {/* Row 3 */}
        <AvlField x={50} y={420} angle={0} length={40} label="field" color={color} />
        <AvlFieldType x={230} y={420} kind="string" size={8} label="string" color={color} />
        <AvlBinding x1={350} y1={410} x2={420} y2={440} label="@bind" color={color} />
        <AvlPersistence x={580} y={420} kind="persistent" size={24} label="persistent" color={color} />

        {/* Section: Tier 4 - Expression */}
        <text x={400} y={560} textAnchor="middle" fill={color} fontSize={16} fontFamily="inherit" fontWeight="bold">
          Tier 4: Expression
        </text>

        {/* Row 4 */}
        <AvlOperator x={80} y={610} name="+" namespace="arithmetic" size={16} color={color} />
        <text x={80} y={640} textAnchor="middle" fill={color} fontSize={9} fontFamily="inherit" opacity={0.7}>Operator</text>
        <AvlSExpr x={170} y={585} width={100} height={50} label="(+ 1 2)" color={color} />
        <text x={220} y={650} textAnchor="middle" fill={color} fontSize={9} fontFamily="inherit" opacity={0.7}>S-Expr</text>
        <AvlLiteral x={380} y={610} value="42" size={14} color={color} />
        <text x={380} y={640} textAnchor="middle" fill={color} fontSize={9} fontFamily="inherit" opacity={0.7}>Literal</text>
        <AvlBindingRef x={530} y={610} path="name" size={14} color={color} />
        <text x={530} y={640} textAnchor="middle" fill={color} fontSize={9} fontFamily="inherit" opacity={0.7}>BindingRef</text>
      </svg>
    </div>
  );
};

const meta: Meta<typeof Gallery> = {
  title: 'Avl/Molecules/AvlGallery',
  component: Gallery,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSymbols: Story = {
  args: {},
};
