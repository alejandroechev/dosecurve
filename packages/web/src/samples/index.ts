export interface SampleDataset {
  name: string;
  description: string;
  data: string;
}

const CLASSIC_INHIBITOR: SampleDataset = {
  name: 'Classic Inhibitor (IC50 ~10 nM)',
  description: 'Steep Hill slope (~1.5), clean triplicates, typical kinase inhibitor',
  data: `Concentration\tResponse
0.01\t99\t101\t100
0.03\t98\t97\t99
0.1\t96\t94\t95
0.3\t88\t86\t90
1\t72\t70\t74
3\t42\t40\t44
10\t18\t16\t20
30\t6\t5\t7
100\t2\t1\t3
300\t1\t0\t1`,
};

const WEAK_INHIBITOR: SampleDataset = {
  name: 'Weak Inhibitor (IC50 ~100 µM)',
  description: 'Shallow Hill slope (~0.7), wide concentration range, some scatter',
  data: `Concentration\tResponse
0.1\t100\t97\t103
1\t98\t95\t101
10\t94\t88\t96
100\t85\t80\t91
1000\t72\t65\t78
10000\t55\t48\t62
100000\t35\t28\t42
300000\t22\t18\t30
1000000\t12\t8\t18
3000000\t6\t3\t11`,
};

const BIPHASIC_RESPONSE: SampleDataset = {
  name: 'Biphasic Response',
  description: 'Two-phase inhibition, incomplete inhibition (bottom ~25%), two binding sites',
  data: `Concentration\tResponse
0.001\t100\t98\t102
0.01\t97\t95\t99
0.1\t82\t78\t85
1\t60\t56\t64
10\t45\t42\t48
100\t38\t35\t41
1000\t34\t30\t37
10000\t30\t27\t33
100000\t27\t24\t30
1000000\t25\t22\t28`,
};

const AGONIST_RESPONSE: SampleDataset = {
  name: 'Agonist Dose-Response (EC50)',
  description: 'Stimulatory curve (response increases with dose), EC50 determination',
  data: `Concentration\tResponse
0.001\t2\t1\t3
0.003\t3\t2\t5
0.01\t5\t4\t7
0.03\t12\t10\t15
0.1\t28\t25\t32
0.3\t52\t48\t55
1\t78\t74\t82
3\t92\t88\t95
10\t98\t96\t100
30\t100\t98\t101`,
};

const NOISY_CLINICAL: SampleDataset = {
  name: 'Noisy Clinical Data',
  description: 'Realistic scatter, some missing replicates, duplicates only',
  data: `Concentration\tResponse
0.1\t102\t95
1\t93\t88
5\t78\t85
25\t62\t54
100\t38
500\t22\t18
2500\t11\t8
10000\t5\t3`,
};

export const SAMPLES: SampleDataset[] = [
  CLASSIC_INHIBITOR,
  WEAK_INHIBITOR,
  BIPHASIC_RESPONSE,
  AGONIST_RESPONSE,
  NOISY_CLINICAL,
];
