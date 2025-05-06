import React, { useState } from "react";
import { PROJECT_STAGES, STAGE_LABELS, ROLE_STAGE_ACCESS } from "../../types/stages";
import { TaskState } from "../../types/task";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { TaskModal } from "./TaskModal";
import { cn } from "../../lib/utils";

interface RowAccessState {
  isActive: boolean;
  canInteract: boolean;
}

interface TaskCompletionState {
  taskId: number;
  roleId: string;
  completedAt: string;
}

export const StageMatrix: React.FC = () => {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<TaskCompletionState[]>([]);
  const [taskDependencies, setTaskDependencies] = useState<Record<number, number[]>>({
    // Alpha Sales dependencies
    2: [1],
    3: [2],
    4: [3],
    5: [4],
    6: [5],
    7: [6],
    8: [7],
    9: [8],
    11: [9],
    // Alpha SSC dependencies
    13: [12],
    14: [13],
    15: [14],
    16: [15],
    17: [16],
    18: [17],
    19: [18],
    // Espora Strategy dependencies
    21: [20],
    22: [21],
    23: [22],
    24: [23],
    25: [24],
    26: [25],
    // Espora Diffusion dependencies
    31: [30],
    32: [31],
    33: [32],
    34: [33],
    35: [34],
    36: [35],
    37: [36],
    38: [37],
    39: [38],
    // Espora Production dependencies
    41: [40],
    42: [41],
    43: [42],
    44: [43],
    45: [44],
    // Espora Management dependencies
    54: [53],
    55: [54],
    56: [55],
    57: [56],
    58: [57],
    59: [58],
    // Espora Accompaniment dependencies - First row
    61: [60],
    62: [61],
    63: [62],
    64: [63],
    65: [64],
    66: [65],
    67: [66],
    68: [67],
    69: [68],
    70: [69],
    82: [70],
    // Espora Accompaniment dependencies - Second row
    72: [71],
    73: [72],
    74: [73],
    75: [74],
    76: [75],
    77: [76],
    78: [77],
    79: [78],
    80: [79],
    81: [80],
    83: [81],
    // Testank Studies dependencies
    91: [90],
    92: [91],
    93: [92],
    94: [93],
    95: [94],
    96: [95],
    97: [96],
    98: [97],
    99: [98],
    100: [99]
  });

  const getRowAccessState = (rowRole: string): RowAccessState => {
    if (!user) return { isActive: false, canInteract: false };
    
    if (user.role === "super-admin") {
      return { isActive: true, canInteract: true };
    }
    
    const isCurrentUserRow = user.role === rowRole;
    return {
      isActive: isCurrentUserRow,
      canInteract: isCurrentUserRow
    };
  };

  const handleButtonClick = (taskNumber: number, rowRole: string) => {
    if ((user?.role === "super-admin" || getRowAccessState(rowRole).canInteract) && isTaskUnlocked(taskNumber, rowRole)) {
      setSelectedTask(taskNumber);
      setSelectedRole(rowRole);
    }
  };

  const isTaskUnlocked = (taskNumber: number, roleId: string): boolean => {
    if (user?.role === "super-admin") return true;
    
    const dependencies = taskDependencies[taskNumber];
    if (!dependencies) return true;
    
    return dependencies.every(depId => isTaskCompleted(depId, roleId));
  };

  const handleTaskCompletion = (taskNumber: number, isCompleted: boolean) => {
    if (!selectedRole) return;
    
    setCompletedTasks(prev => {
      // Remove existing completion state for this task and role
      const filtered = prev.filter(t => !(t.taskId === taskNumber && t.roleId === selectedRole));
      
      // Add new completion state if task is completed
      if (isCompleted) {
        return [...filtered, { 
          taskId: taskNumber, 
          roleId: selectedRole,
          completedAt: new Date().toISOString()
        }];
      }
      
      return filtered;
    });
  };

  const isTaskCompleted = (taskNumber: number, roleId: string): boolean => {
    return completedTasks.some(t => t.taskId === taskNumber && t.roleId === roleId);
  };

  const getButtonStyles = (taskNumber: number, roleId: string, hasLogo: boolean = false) => {
    const completed = isTaskCompleted(taskNumber, roleId);
    const unlocked = isTaskUnlocked(taskNumber, roleId);
    const { canInteract } = getRowAccessState(roleId);
    
    const baseStyles = `
      ${hasLogo ? 'w-8 h-8' : 'w-5 h-5'}
      p-0 text-[10px] font-medium rounded-full shadow-lg
      transition-all duration-200 ease-out
      group relative
      ${completed
        ? 'bg-gray-900 text-white border border-gray-700 hover:bg-gray-800 ring-1 ring-gray-700'
        : unlocked
          ? 'bg-[#FFF1A8] text-black border border-[#E6D997] hover:scale-110'
          : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'}
      ${!canInteract && !completed ? 'opacity-50' : ''}
    `;
    
    return baseStyles;
  };

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="w-full h-full flex flex-col pl-24">
        <div className="grid gap-1" style={{ gridTemplateColumns: '13.75% 13.75% 45% 13.75% 13.75%' }}>
          {PROJECT_STAGES.map((stage) => (
            <div
              key={stage}
              className="bg-gray-900 text-white px-1 py-1 text-center text-xs font-medium truncate"
            >
              {STAGE_LABELS[stage]}
            </div>
          ))}
        </div>
        
        {/* Role rows with stage access */}
        <div className="flex-1 grid grid-rows-8 gap-0.5">
          {ROLE_STAGE_ACCESS.map((access) => {
            const { isActive, canInteract } = getRowAccessState(access.role);
            
            return (
            <div 
              key={access.role} 
              className={cn(
                "relative grid gap-0.5 transition-all duration-300 min-h-[20px]",
                "hover:z-10",
                !canInteract && user?.role !== "super-admin" && "pointer-events-none",
                access.role === "espora-accompaniment" ? "min-h-[28px]" : "min-h-[20px]"
              )}
              style={{ gridTemplateColumns: '13.75% 13.75% 45% 13.75% 13.75%' }}
            >
              <div className="absolute -left-[6rem] h-full flex items-center">
                <span className={cn("text-[10px] font-semibold tracking-wider flex flex-col items-center bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100",
                  access.role === 'alpha-sales' && "text-[#FFE24E]",
                  access.role === 'alpha-ssc' && "text-[#F29538]",
                  access.role === 'espora-strategy' && "text-[#DE3838]",
                  access.role === 'espora-diffusion' && "text-blue-400",
                  access.role === 'espora-production' && "text-green-400",
                  access.role === 'espora-management' && "text-green-500",
                  access.role === 'espora-accompaniment' && "text-pink-400",
                  access.role === 'testank-studies' && "text-purple-400"
                )}>
                  {access.role === 'alpha-sales' ? 'VENTAS' :
                    access.role === 'alpha-ssc' ? 'SSC' :
                    access.role === 'espora-strategy' ? <><span className="opacity-60">ESPORA</span><span>ESTRATEGIA</span></> :
                    access.role === 'testank-studies' ? <><span className="opacity-60">TESTANK</span><span>ESTUDIOS</span></> :
                    access.role === 'espora-accompaniment' ? <><span className="opacity-60">ESPORA</span><span>ACOMPAÑAMIENTO</span></> :
                    access.role === 'espora-management' ? <><span className="opacity-60">ESPORA</span><span>GERENCIA</span></> :
                    access.role === 'espora-production' ? <><span className="opacity-60">ESPORA</span><span>PRODUCCIÓN</span></> :
                    access.role === 'espora-diffusion' ? <><span className="opacity-60">ESPORA</span><span>DIFUSIÓN</span></> : ''}
                </span>
              </div>
              {PROJECT_STAGES.map((stage) => {
                const hasAccess = access.stages.includes(stage);
                const isFirstCell = access.role === "alpha-sales" && stage === "acquisition";
                
                const cellStyles = `
                  relative h-full p-0.5 transition-all duration-300 ease-in-out 
                  flex items-center justify-center ${access.role === "espora-accompaniment" ? "py-0.5" : "py-0"}
                  ${getBackgroundColor(access.role, hasAccess)} ${!isActive && user?.role !== access.role ? 'opacity-40 saturate-[0.7]' : ''}
                  ${(hasAccess && (isActive || user?.role === "super-admin")) ? 'hover:z-20' : ''}
                  ${stage === "acquisition" ? 'origin-left' : 
                    stage === "calibration" ? 'origin-right' : 
                    'origin-center'}
                `;
                
                return (
                  <div
                    key={`${access.role}-${stage}`}
                    className={cellStyles}
                  >
                    {stage === "acquisition" && access.role === "alpha-ssc" && (
                      <div className="flex items-center justify-center h-full">
                        <Button
                          onClick={() => handleButtonClick(10, access.role)}
                          className={getButtonStyles(10, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(10, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                    {isFirstCell && (
                      <div className="flex flex-col w-full max-w-[420px] mx-auto transition-all duration-300 ease-in-out">
                        <div className="relative flex items-center justify-between">
                          <div className="absolute left-2 right-10 h-0.5 bg-gray-200 top-1/2 transform -translate-y-1/2" />
                          
                          <div className="flex items-center gap-1.5 transition-all duration-300 ease-in-out">
                            {[...Array(8)].map((_, i) => (
                              <Button
                                key={i}
                                aria-label={`Process ${i + 1}`}
                                onClick={() => handleButtonClick(i + 1, access.role)}
                                disabled={!canInteract}
                                className={`relative z-10 ${getButtonStyles(i + 1, access.role, false)}`} 
                              />
                            ))}
                          </div>
                          
                          <div className="relative z-10">
                            <Button
                              onClick={() => handleButtonClick(9, access.role)}
                              className={`w-10 h-10 p-0 text-[10px] font-medium rounded-full shadow-lg
                                transition-all duration-300 ease-out transform hover:scale-150
                                ${isTaskCompleted(9, access.role)
                                  ? 'bg-gray-900 text-white border border-gray-700 hover:bg-gray-800 ring-1 ring-gray-700'
                                  : 'bg-[#FFF1A8] text-black border border-[#E6D997]'}`}
                            >
                              <img 
                                src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                                alt="Espora Icon"
                                className={`w-full h-full object-contain p-2 ${isTaskCompleted(9, access.role) ? 'filter invert' : ''}`}
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {stage === "development" && access.role === "alpha-sales" && (
                      <div className="flex items-center justify-center h-full">
                        <Button
                          onClick={() => handleButtonClick(11, access.role)}
                          className={getButtonStyles(11, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(11, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                    {stage === "development" && access.role === "alpha-ssc" && (
                      <div className="grid grid-cols-7 items-center justify-items-center w-full gap-1 px-2">
                        {[...Array(5)].map((_, i) => (
                          <Button
                            key={i}
                            aria-label={`Process ${i + 1}`}
                            onClick={() => handleButtonClick(12 + i, access.role)}
                            disabled={!canInteract}
                            className={getButtonStyles(12 + i, access.role)}
                          />
                        ))}
                        <Button
                          onClick={() => handleButtonClick(17, access.role)}
                          className={getButtonStyles(17, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(17, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                        <Button
                          onClick={() => handleButtonClick(18, access.role)}
                          className={getButtonStyles(18, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(18, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                    {stage === "presentation" && access.role === "alpha-ssc" && (
                      <div className="flex items-center justify-center h-full">
                        <Button
                          onClick={() => handleButtonClick(19, access.role)}
                          className={getButtonStyles(19, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(19, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                    {stage === "development" && access.role === "espora-strategy" && (
                      <div className="grid grid-cols-7 items-center justify-items-center w-full gap-1 px-2">
                        {[...Array(6)].map((_, i) => (
                          <Button
                            key={i}
                            aria-label={`Process ${i + 1}`}
                            onClick={() => handleButtonClick(20 + i, access.role)}
                            disabled={!canInteract}
                            className={getButtonStyles(20 + i, access.role)}
                          />
                        ))}
                        <Button
                          onClick={() => setSelectedTask(26)}
                          className={getButtonStyles(26, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(26, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                    {stage === "development" && access.role === "espora-diffusion" && (
                      <div className="grid grid-cols-10 items-center justify-items-center w-full gap-1 px-2">
                        {[...Array(9)].map((_, i) => (
                            <Button
                              key={i}
                              aria-label={`Process ${i + 1}`}
                              onClick={() => handleButtonClick(30 + i, access.role)}
                              disabled={!canInteract}
                              className={getButtonStyles(30 + i, access.role)}
                            />
                        ))}
                        <Button
                          onClick={() => handleButtonClick(39, access.role)}
                          className={getButtonStyles(39, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(39, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                    {stage === "development" && access.role === "espora-production" && (
                      <div className="grid grid-cols-6 items-center justify-items-center w-full gap-1 px-2">
                        {[...Array(5)].map((_, i) => (
                            <Button
                              key={i}
                              aria-label={`Process ${i + 1}`}
                              onClick={() => handleButtonClick(40 + i, access.role)}
                              disabled={!canInteract}
                              className={getButtonStyles(40 + i, access.role)}
                            />
                        ))}
                        <Button
                          onClick={() => handleButtonClick(45, access.role)}
                          className={getButtonStyles(45, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(45, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                    {stage === "eho" && access.role === "espora-management" && (
                      <div className="flex items-center justify-center gap-1.5 h-full">
                        
                      </div>
                    )}
                    {stage === "development" && access.role === "espora-management" && (
                      <div className="grid grid-cols-6 items-center justify-items-center w-full gap-1 px-2">
                        {[...Array(5)].map((_, i) => (
                            <Button
                              key={i}
                              aria-label={`Process ${i + 1}`}
                              onClick={() => handleButtonClick(53 + i, access.role)}
                              disabled={!canInteract}
                              className={getButtonStyles(53 + i, access.role)}
                            />
                        ))}
                        <Button
                          onClick={() => handleButtonClick(58, access.role)}
                          className={getButtonStyles(58, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(58, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                    {stage === "presentation" && access.role === "espora-management" && (
                      <div className="flex items-center justify-center h-full">
                        <Button
                          onClick={() => handleButtonClick(59, access.role)}
                          className={getButtonStyles(59, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(59, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                    {stage === "development" && access.role === "espora-accompaniment" && (
                      <div className="flex flex-col gap-1 w-full px-1">
                        <div className="grid grid-cols-12 items-center justify-items-center gap-1">
                          {[...Array(11)].map((_, i) => (
                            <Button
                              key={i}
                              aria-label={`Process ${i + 1}`}
                              onClick={() => handleButtonClick(60 + i, access.role)}
                              disabled={!canInteract}
                              className={getButtonStyles(60 + i, access.role)}
                            />
                          ))}
                          <Button
                            onClick={() => handleButtonClick(82, access.role)}
                            className={`${getButtonStyles(82, access.role, true)} -ml-2 transform hover:scale-110 transition-transform duration-200`}
                          >
                            <img 
                              src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                              alt="Espora Icon"
                              className={`w-full h-full object-contain p-1 ${isTaskCompleted(82, access.role) ? 'filter invert' : ''}`}
                            />
                          </Button>
                        </div>
                        <div className="grid grid-cols-12 items-center justify-items-center gap-1">
                          {[...Array(11)].map((_, i) => (
                            <Button
                              key={i}
                              aria-label={`Process ${i + 12}`}
                              onClick={() => handleButtonClick(71 + i, access.role)}
                              disabled={!canInteract}
                              className={getButtonStyles(71 + i, access.role)}
                            />
                          ))}
                          <Button
                            onClick={() => handleButtonClick(83, access.role)}
                            className={`${getButtonStyles(83, access.role, true)} -ml-2 transform hover:scale-110 transition-transform duration-200`}
                          >
                            <img 
                              src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                              alt="Espora Icon"
                              className={`w-full h-full object-contain p-1 ${isTaskCompleted(83, access.role) ? 'filter invert' : ''}`}
                            />
                          </Button>
                        </div>
                      </div>
                    )}
                    {stage === "development" && access.role === "testank-studies" && (
                      <div className="grid grid-cols-10 items-center justify-items-center w-full gap-1 px-2">
                        {[...Array(9)].map((_, i) => (
                            <Button
                              key={i}
                              aria-label={`Process ${i + 1}`}
                              onClick={() => handleButtonClick(90 + i, access.role)}
                              disabled={!canInteract}
                              className={getButtonStyles(90 + i, access.role)}
                            />
                        ))}
                        <Button
                          onClick={() => handleButtonClick(99, access.role)}
                          className={getButtonStyles(99, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(99, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                    {stage === "presentation" && access.role === "testank-studies" && (
                      <div className="flex items-center justify-center h-full">
                        <Button
                          onClick={() => handleButtonClick(100, access.role)}
                          className={getButtonStyles(100, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(100, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                    {stage === "eho" && hasAccess && (
                      <div className="flex items-center justify-center h-full">
                        <Button
                          onClick={() => handleButtonClick(101, access.role)}
                          className={getButtonStyles(101, access.role, true)}
                        >
                          <img 
                            src="https://raw.githubusercontent.com/Nefta11/MiPortafolioNefta/refs/heads/main/assets/iconEsporaIcon.png"
                            alt="Espora Icon"
                            className={`w-full h-full object-contain p-1 ${isTaskCompleted(101, access.role) ? 'filter invert' : ''}`}
                          />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
          })}
        </div>
      </div>
      <TaskModal
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        taskNumber={selectedTask || 0}
        isOrangeButton={user?.role === "alpha-ssc"}
        onComplete={(taskNum, completed) => handleTaskCompletion(taskNum, completed)}
        isCompleted={selectedTask && selectedRole ? isTaskCompleted(selectedTask, selectedRole) : false}
      />
    </div>
  );
};

function getBackgroundColor(role: string, hasAccess: boolean): string {
  if (!hasAccess) return 'bg-gray-100';
  
  const baseStyles = "transition-all duration-300";
  
  switch (role) {
    case 'alpha-sales':
      return `bg-[#FFF7AE] ${baseStyles}`;
    case 'alpha-ssc':
      return `bg-[#FFB98E] ${baseStyles}`;
    case 'espora-strategy':
      return `bg-[#FF9E9E] ${baseStyles}`;
    case 'espora-diffusion':
      return `bg-[#A8D8FF] ${baseStyles}`;
    case 'espora-production':
      return `bg-[#98FFB3] ${baseStyles}`;
    case 'espora-management':
      return `bg-[#7DFFB3] ${baseStyles}`;
    case 'espora-accompaniment':
      return `bg-[#FFB3E6] ${baseStyles}`;
    case 'testank-studies':
      return `bg-[#E6B3FF] ${baseStyles}`;
    default:
      return 'bg-gray-100';
  }
}

function getButtonColor(role: string): string {
  switch (role) {
    case 'alpha-sales':
      return 'bg-[#FFF1A8] text-black border border-[#E6D997]';
    case 'alpha-ssc':
      
      return 'bg-[#FFF1A8] text-black border border-[#E6D997]';
    case 'espora-strategy':
      return 'bg-[#FFF1A8] text-black border border-[#E6D997]';
    case 'espora-diffusion':
      return 'bg-[#FFF1A8] text-black border border-[#E6D997]';
    case 'espora-production':
      return 'bg-[#FFF1A8] text-black border border-[#E6D997]';
    case 'espora-management':
      return 'bg-[#FFF1A8] text-black border border-[#E6D997]';
    case 'espora-accompaniment':
      return 'bg-[#FFF1A8] text-black border border-[#E6D997]';
    case 'testank-studies':
      return 'bg-[#FFF1A8] text-black border border-[#E6D997]';
    default:
      return 'bg-[#FFF1A8] text-black border border-[#E6D997]';
  }
}