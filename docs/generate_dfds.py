import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ArrowStyle

def create_dfd_level_0():
    fig, ax = plt.subplots(figsize=(14, 8), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 8)
    ax.axis('off')

    # Background color
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')

    # Title
    ax.text(7, 7.5, 'DATA FLOW DIAGRAM (DFD) — LEVEL 0 (CONTEXT DIAGRAM)', 
            ha='center', va='center', fontsize=14, fontfamily='sans-serif', color='#0F172A')
    ax.text(7, 7.15, 'System: FitPulse — Your Personal Fitness Intelligence Platform', 
            ha='center', va='center', fontsize=10, fontfamily='sans-serif', color='#475569')

    # External Entity: Athlete / Web Client (Left)
    entity_user = FancyBboxPatch((0.8, 2.5), 2.8, 3.0, boxstyle="square,pad=0.1", 
                                 edgecolor='#0284C7', facecolor='#F0F9FF', linewidth=2)
    ax.add_patch(entity_user)
    ax.text(2.2, 5.1, 'EXTERNAL ENTITY', ha='center', va='center', fontsize=8, color='#0284C7', fontfamily='sans-serif')
    ax.text(2.2, 4.3, 'Athlete / Client\nWeb Browser', ha='center', va='center', fontsize=11, color='#0F172A', fontfamily='sans-serif')
    ax.text(2.2, 3.2, '[React + Vite Client\nDesktop & Mobile]', ha='center', va='center', fontsize=8.5, color='#475569', fontfamily='sans-serif')

    # Central Process: Process 0 (FitPulse Platform)
    proc_circle = patches.Circle((7.0, 4.0), 1.6, edgecolor='#16A34A', facecolor='#F0FDF4', linewidth=2.5)
    ax.add_patch(proc_circle)
    ax.text(7.0, 4.7, '0', ha='center', va='center', fontsize=16, color='#16A34A', fontfamily='sans-serif')
    ax.text(7.0, 4.0, 'FitPulse Fitness\nIntelligence\nPlatform', ha='center', va='center', fontsize=10.5, color='#0F172A', fontfamily='sans-serif')
    ax.text(7.0, 3.0, '[MERN Architecture]', ha='center', va='center', fontsize=8, color='#475569', fontfamily='sans-serif')

    # External Entity: MongoDB Storage Engine (Right)
    entity_db = FancyBboxPatch((10.4, 2.5), 2.8, 3.0, boxstyle="square,pad=0.1", 
                               edgecolor='#D97706', facecolor='#FFFBEB', linewidth=2)
    ax.add_patch(entity_db)
    ax.text(11.8, 5.1, 'EXTERNAL ENTITY', ha='center', va='center', fontsize=8, color='#D97706', fontfamily='sans-serif')
    ax.text(11.8, 4.3, 'MongoDB Storage\nEngine', ha='center', va='center', fontsize=11, color='#0F172A', fontfamily='sans-serif')
    ax.text(11.8, 3.2, '[Local Daemon / Atlas\n10 Collections]', ha='center', va='center', fontsize=8.5, color='#475569', fontfamily='sans-serif')

    # Arrows Left to Center (User to Process 0)
    # Upper arrow: Credentials & Biometric data
    ax.annotate('', xy=(5.4, 4.6), xytext=(3.6, 4.6),
                arrowprops=dict(arrowstyle="->", color='#0284C7', lw=1.5, mutation_scale=15))
    ax.text(4.5, 4.9, 'Credentials, Steps, Meals,\nWorkouts, Sleep, Water, Weight', 
            ha='center', va='bottom', fontsize=7.5, color='#0F172A', fontfamily='sans-serif')

    # Lower arrow: System to User
    ax.annotate('', xy=(3.6, 3.4), xytext=(5.4, 3.4),
                arrowprops=dict(arrowstyle="->", color='#16A34A', lw=1.5, mutation_scale=15))
    ax.text(4.5, 2.9, 'JWT Tokens, Live KPI Cards,\nRecharts Arrays, Consistency Score', 
            ha='center', va='top', fontsize=7.5, color='#0F172A', fontfamily='sans-serif')

    # Arrows Center to Right (Process 0 to MongoDB)
    # Upper arrow: Writes & Pipelines
    ax.annotate('', xy=(10.4, 4.6), xytext=(8.6, 4.6),
                arrowprops=dict(arrowstyle="->", color='#D97706', lw=1.5, mutation_scale=15))
    ax.text(9.5, 4.9, 'CRUD Operations, Compound Indexes,\nMulti-Stage Aggregation Pipelines', 
            ha='center', va='bottom', fontsize=7.5, color='#0F172A', fontfamily='sans-serif')

    # Lower arrow: Database to Process 0
    ax.annotate('', xy=(8.6, 3.4), xytext=(10.4, 3.4),
                arrowprops=dict(arrowstyle="->", color='#16A34A', lw=1.5, mutation_scale=15))
    ax.text(9.5, 2.9, 'Raw BSON Document Records,\nAggregated Pipeline Result Sets', 
            ha='center', va='top', fontsize=7.5, color='#0F172A', fontfamily='sans-serif')

    # Footer
    ax.text(7, 0.5, 'Figure 4.1: DFD Level 0 — Context Diagram of FitPulse Intelligence Platform', 
            ha='center', va='center', fontsize=9.5, color='#334155', fontfamily='sans-serif')

    plt.tight_layout()
    plt.savefig('fitpulse/docs/images/dfd_level_0.png', dpi=300, facecolor='#FFFFFF')
    plt.close()
    print('Generated dfd_level_0.png')

def create_dfd_level_1():
    fig, ax = plt.subplots(figsize=(16, 11), dpi=300)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 11)
    ax.axis('off')

    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')

    # Title
    ax.text(8, 10.5, 'DATA FLOW DIAGRAM (DFD) — LEVEL 1 (SYSTEM DECOMPOSITION)', 
            ha='center', va='center', fontsize=14, fontfamily='sans-serif', color='#0F172A')
    ax.text(8, 10.15, 'Functional Process Partitioning & Inter-Store Data Movement', 
            ha='center', va='center', fontsize=10, fontfamily='sans-serif', color='#475569')

    # External Entity (Top Left)
    user_box = FancyBboxPatch((0.6, 6.8), 2.2, 2.4, boxstyle="square,pad=0.1", 
                              edgecolor='#0284C7', facecolor='#F0F9FF', linewidth=1.8)
    ax.add_patch(user_box)
    ax.text(1.7, 8.7, 'EXTERNAL ENTITY', ha='center', va='center', fontsize=7.5, color='#0284C7')
    ax.text(1.7, 7.9, 'Athlete / Client\nWeb Browser', ha='center', va='center', fontsize=10, color='#0F172A')

    # Process 1.0 (Auth)
    proc1 = FancyBboxPatch((4.0, 7.8), 2.8, 1.4, boxstyle="round,pad=0.1", 
                           edgecolor='#16A34A', facecolor='#F0FDF4', linewidth=1.5)
    ax.add_patch(proc1)
    ax.text(5.4, 8.8, '1.0', ha='center', va='center', fontsize=10, color='#16A34A')
    ax.text(5.4, 8.3, 'User Authentication &\nAccess Control', ha='center', va='center', fontsize=8.5, color='#0F172A')

    # Process 2.0 (Validation)
    proc2 = FancyBboxPatch((4.0, 5.8), 2.8, 1.4, boxstyle="round,pad=0.1", 
                           edgecolor='#16A34A', facecolor='#F0FDF4', linewidth=1.5)
    ax.add_patch(proc2)
    ax.text(5.4, 6.8, '2.0', ha='center', va='center', fontsize=10, color='#16A34A')
    ax.text(5.4, 6.3, 'Input Sanitization &\nZod Schema Validation', ha='center', va='center', fontsize=8.5, color='#0F172A')

    # Process 3.0 (Calculations)
    proc3 = FancyBboxPatch((7.8, 5.8), 2.8, 1.4, boxstyle="round,pad=0.1", 
                           edgecolor='#16A34A', facecolor='#F0FDF4', linewidth=1.5)
    ax.add_patch(proc3)
    ax.text(9.2, 6.8, '3.0', ha='center', va='center', fontsize=10, color='#16A34A')
    ax.text(9.2, 6.3, 'Biometric Algorithmic\nCalculation Engine', ha='center', va='center', fontsize=8.5, color='#0F172A')

    # Data Store D1: Users
    d1 = FancyBboxPatch((8.0, 7.8), 2.4, 1.2, boxstyle="square,pad=0.05", 
                        edgecolor='#D97706', facecolor='#FFFBEB', linewidth=1.2)
    ax.add_patch(d1)
    ax.text(9.2, 8.6, 'D1 | Users', ha='center', va='center', fontsize=9, color='#D97706')
    ax.text(9.2, 8.1, 'Profiles, Preferences,\nHashed Passwords', ha='center', va='center', fontsize=7.5, color='#0F172A')

    # Central Row of Data Stores (D2 - D8)
    stores = [
        ('D2', 'Activity Logs', 'Steps, Stride, Walk Burn', 1.0),
        ('D3', 'Meal Logs', 'Items, Macro Snapshots', 3.1),
        ('D4', 'Workout Logs', 'Sets, Reps, Weight, Volume', 5.2),
        ('D5', 'Sleep Logs', 'UTC Times, Duration, Stars', 7.3),
        ('D6', 'Water Logs', 'Intakes, Timestamp, ml', 9.4),
        ('D7', 'Measurements', 'Weight, Waist, Hip, Arm', 11.5),
        ('D8', 'Goals', 'Active Targets across 7 Domains', 13.6)
    ]
    for tag, name, desc, x in stores:
        s_box = FancyBboxPatch((x, 3.4), 1.9, 1.3, boxstyle="square,pad=0.05", 
                               edgecolor='#D97706', facecolor='#FFFBEB', linewidth=1.2)
        ax.add_patch(s_box)
        ax.text(x + 0.95, 4.3, f'{tag} | {name}', ha='center', va='center', fontsize=7.5, color='#D97706')
        ax.text(x + 0.95, 3.8, desc, ha='center', va='center', fontsize=6.2, color='#0F172A')

    # Process 4.0: Aggregations (Bottom Middle)
    proc4 = FancyBboxPatch((5.0, 1.3), 3.4, 1.4, boxstyle="round,pad=0.1", 
                           edgecolor='#8B5CF6', facecolor='#F5F3FF', linewidth=1.5)
    ax.add_patch(proc4)
    ax.text(6.7, 2.3, '4.0', ha='center', va='center', fontsize=10, color='#8B5CF6')
    ax.text(6.7, 1.8, 'MongoDB Multi-Stage\nAggregation Engine', ha='center', va='center', fontsize=8.5, color='#0F172A')

    # Process 5.0: Visualizer Formatter (Bottom Right)
    proc5 = FancyBboxPatch((10.2, 1.3), 3.4, 1.4, boxstyle="round,pad=0.1", 
                           edgecolor='#16A34A', facecolor='#F0FDF4', linewidth=1.5)
    ax.add_patch(proc5)
    ax.text(11.9, 2.3, '5.0', ha='center', va='center', fontsize=10, color='#16A34A')
    ax.text(11.9, 1.8, 'Presentation Transformation\n& Visualization Formatter', ha='center', va='center', fontsize=8.5, color='#0F172A')

    # Connectors & Arrows
    # User to Auth
    ax.annotate('', xy=(4.0, 8.5), xytext=(2.8, 8.5),
                arrowprops=dict(arrowstyle="->", color='#0284C7', lw=1.2))
    ax.text(3.4, 8.7, 'Credentials', ha='center', va='bottom', fontsize=7, color='#0F172A')

    # Auth to User (Token)
    ax.annotate('', xy=(2.8, 7.5), xytext=(4.0, 7.5),
                arrowprops=dict(arrowstyle="->", color='#16A34A', lw=1.2))
    ax.text(3.4, 7.2, 'JWT Token', ha='center', va='top', fontsize=7, color='#0F172A')

    # Auth to D1
    ax.annotate('', xy=(8.0, 8.5), xytext=(6.8, 8.5),
                arrowprops=dict(arrowstyle="<->", color='#D97706', lw=1.2))

    # User to Process 2.0 (Biometrics)
    ax.annotate('', xy=(4.0, 6.5), xytext=(2.8, 7.0),
                arrowprops=dict(arrowstyle="->", color='#0284C7', lw=1.2))
    ax.text(3.4, 6.4, 'Biometric Logs', ha='center', va='bottom', fontsize=7, color='#0F172A')

    # Process 2.0 to Process 3.0
    ax.annotate('', xy=(7.8, 6.5), xytext=(6.8, 6.5),
                arrowprops=dict(arrowstyle="->", color='#16A34A', lw=1.2))
    ax.text(7.3, 6.7, 'Validated Payload', ha='center', va='bottom', fontsize=7, color='#0F172A')

    # Process 3.0 down to stores
    ax.annotate('', xy=(8.5, 4.7), xytext=(8.5, 5.8),
                arrowprops=dict(arrowstyle="->", color='#16A34A', lw=1.2))
    ax.text(9.0, 5.2, 'Stores Processed Documents', ha='left', va='center', fontsize=7, color='#16A34A')

    # Stores to Process 4.0
    ax.annotate('', xy=(6.5, 2.7), xytext=(6.5, 3.4),
                arrowprops=dict(arrowstyle="->", color='#8B5CF6', lw=1.2))
    ax.text(5.5, 3.0, 'Raw Collection Records', ha='center', va='center', fontsize=7, color='#8B5CF6')

    # Process 4.0 to Process 5.0
    ax.annotate('', xy=(10.2, 2.0), xytext=(8.4, 2.0),
                arrowprops=dict(arrowstyle="->", color='#8B5CF6', lw=1.2))
    ax.text(9.3, 2.2, 'Reduced Pipeline Results', ha='center', va='bottom', fontsize=7, color='#0F172A')

    # Process 5.0 back to User
    ax.annotate('', xy=(1.7, 6.8), xytext=(11.9, 1.3),
                arrowprops=dict(arrowstyle="->", color='#16A34A', lw=1.2, connectionstyle="arc3,rad=-0.25"))
    ax.text(6.0, 0.7, 'Live KPI Cards, Recharts Data Arrays, Habit Index', ha='center', va='center', fontsize=7.5, color='#16A34A')

    # Footer
    ax.text(8, 0.3, 'Figure 4.2: DFD Level 1 — System-Wide Functional Decomposition of FitPulse', 
            ha='center', va='center', fontsize=9.5, color='#334155', fontfamily='sans-serif')

    plt.tight_layout()
    plt.savefig('fitpulse/docs/images/dfd_level_1.png', dpi=300, facecolor='#FFFFFF')
    plt.close()
    print('Generated dfd_level_1.png')

def create_dfd_level_2():
    fig, ax = plt.subplots(figsize=(16, 11), dpi=300)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 11)
    ax.axis('off')

    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')

    # Title
    ax.text(8, 10.5, 'DATA FLOW DIAGRAM (DFD) — LEVEL 2: PROCESS 4.0 (AGGREGATION ENGINE)', 
            ha='center', va='center', fontsize=13.5, fontfamily='sans-serif', color='#0F172A')
    ax.text(8, 10.15, 'Subsystem Decomposition of MongoDB Multi-Stage Aggregation Pipelines', 
            ha='center', va='center', fontsize=9.5, fontfamily='sans-serif', color='#475569')

    # Top Input: Query Parameters
    param_box = FancyBboxPatch((5.5, 8.8), 5.0, 0.9, boxstyle="round,pad=0.1", 
                               edgecolor='#0284C7', facecolor='#F0F9FF', linewidth=1.2)
    ax.add_patch(param_box)
    ax.text(8.0, 9.25, 'Client Query Parameters (userId, targetDate, startDate, endDate)', 
            ha='center', va='center', fontsize=8.5, color='#0284C7')

    # Sub-Processes (Pipelines)
    pipelines = [
        ('4.1', 'Weekly Steps Aggregator\n(Pipeline 1: $match, $group, $sort)', 1.0, 6.2, 'D2: Activity Logs'),
        ('4.2', 'Nutrition Macro Aggregator\n(Pipeline 2: $unwind, $group)', 6.0, 6.2, 'D3: Meal Logs'),
        ('4.3', 'Training Volume Analyzer\n(Pipeline 3: $multiply, $group)', 11.0, 6.2, 'D4: Workout Logs'),
        ('4.4', 'Sleep Variance Analyzer\n(Pipeline 4: $group, $stdDevPop)', 1.0, 3.6, 'D5: Sleep Logs'),
        ('4.5', 'Caloric Balance Cross-Joiner\n(Pipeline 5: $lookup join D2,D3,D4)', 6.0, 3.6, 'D2, D3, D4 Logs'),
        ('4.8', 'Lifestyle Consistency Synthesizer\n(Pipeline 8: Multi-Pillar Adherence)', 11.0, 3.6, 'D1, D2, D3, D4, D5, D6')
    ]

    for p_id, p_name, x, y, store_source in pipelines:
        p_box = FancyBboxPatch((x, y), 4.0, 1.4, boxstyle="round,pad=0.1", 
                               edgecolor='#8B5CF6', facecolor='#F5F3FF', linewidth=1.3)
        ax.add_patch(p_box)
        ax.text(x + 2.0, y + 1.05, f'Process {p_id}', ha='center', va='center', fontsize=8, color='#8B5CF6')
        ax.text(x + 2.0, y + 0.65, p_name, ha='center', va='center', fontsize=7.5, color='#0F172A')
        ax.text(x + 2.0, y + 0.2, f'Source: {store_source}', ha='center', va='center', fontsize=6.8, color='#D97706')

        # Connect param_box to upper row
        if y > 5:
            ax.annotate('', xy=(x + 2.0, y + 1.4), xytext=(8.0, 8.8),
                        arrowprops=dict(arrowstyle="->", color='#94A3B8', lw=1.0))
        else:
            ax.annotate('', xy=(x + 2.0, y + 1.4), xytext=(x + 2.0, y + 2.2),
                        arrowprops=dict(arrowstyle="->", color='#94A3B8', lw=1.0))

    # Process 5.0 (Bottom Center)
    proc5 = FancyBboxPatch((5.0, 1.0), 6.0, 1.2, boxstyle="round,pad=0.1", 
                           edgecolor='#16A34A', facecolor='#F0FDF4', linewidth=1.5)
    ax.add_patch(proc5)
    ax.text(8.0, 1.8, 'To Process 5.0: Presentation Transformation Formatter', ha='center', va='center', fontsize=9, color='#16A34A')
    ax.text(8.0, 1.35, 'Structures Recharts Bar/Area/Line Arrays & SVG Donut Payloads', ha='center', va='center', fontsize=7.5, color='#475569')

    # Arrows from bottom row to Process 5.0
    ax.annotate('', xy=(6.5, 2.2), xytext=(3.0, 3.6),
                arrowprops=dict(arrowstyle="->", color='#8B5CF6', lw=1.2))
    ax.annotate('', xy=(8.0, 2.2), xytext=(8.0, 3.6),
                arrowprops=dict(arrowstyle="->", color='#8B5CF6', lw=1.2))
    ax.annotate('', xy=(9.5, 2.2), xytext=(13.0, 3.6),
                arrowprops=dict(arrowstyle="->", color='#8B5CF6', lw=1.2))

    # Footer
    ax.text(8, 0.4, 'Figure 4.3: DFD Level 2 — Subsystem Decomposition of Process 4.0 (MongoDB Aggregation Engine)', 
            ha='center', va='center', fontsize=9.5, color='#334155', fontfamily='sans-serif')

    plt.tight_layout()
    plt.savefig('fitpulse/docs/images/dfd_level_2.png', dpi=300, facecolor='#FFFFFF')
    plt.close()
    print('Generated dfd_level_2.png')

if __name__ == '__main__':
    create_dfd_level_0()
    create_dfd_level_1()
    create_dfd_level_2()
