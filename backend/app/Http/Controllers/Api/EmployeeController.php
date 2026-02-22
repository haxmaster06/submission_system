<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $employees = Employee::orderBy('name')->get();
        return response()->json($employees);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check for Bulk Insert
        if ($request->has('employees') && is_array($request->employees)) {
            $validator = Validator::make($request->all(), [
                'employees' => 'required|array|min:1',
                'employees.*.name' => 'required|string|max:255',
                'employees.*.department' => 'required|string|max:255',
                'employees.*.base_salary' => 'required|numeric|min:0',
                'employees.*.is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $created = [];
            foreach ($request->employees as $empData) {
                // Default is_active to true if not present in individual row
                $empData['is_active'] = $empData['is_active'] ?? true;
                $created[] = Employee::create($empData);
            }

            return response()->json([
                'message' => count($created) . ' employees created successfully.',
                'employees' => $created
            ], 201);
        }

        // Single Insert (Fallback)
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'base_salary' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employee = Employee::create($request->all());

        return response()->json([
            'message' => 'Employee created successfully.',
            'employee' => $employee
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee)
    {
        return response()->json($employee);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'base_salary' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employee->update($request->all());

        return response()->json([
            'message' => 'Employee updated successfully.',
            'employee' => $employee
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        $employee->delete();

        return response()->json([
            'message' => 'Employee deleted successfully.'
        ]);
    }
}