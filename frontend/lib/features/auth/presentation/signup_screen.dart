import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_exception.dart';
import '../application/auth_provider.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _companyCodeController = TextEditingController();
  final _companyNameController = TextEditingController();
  final _companyEmailController = TextEditingController();
  final _adminNameController = TextEditingController();
  final _adminEmailController = TextEditingController();
  final _adminPasswordController = TextEditingController();
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void dispose() {
    _companyCodeController.dispose();
    _companyNameController.dispose();
    _companyEmailController.dispose();
    _adminNameController.dispose();
    _adminEmailController.dispose();
    _adminPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });
    try {
      await ref.read(authProvider.notifier).signup(
            companyCode: _companyCodeController.text.trim(),
            companyName: _companyNameController.text.trim(),
            companyEmail: _companyEmailController.text.trim(),
            adminName: _adminNameController.text.trim(),
            adminEmail: _adminEmailController.text.trim(),
            adminPassword: _adminPasswordController.text,
          );
    } catch (e) {
      setState(() => _errorMessage = e is ApiException ? e.message : 'Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create your workspace')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.errorContainer,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: TextStyle(color: Theme.of(context).colorScheme.onErrorContainer),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  Text('Company', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _companyCodeController,
                    decoration: const InputDecoration(
                      labelText: 'Company code',
                      hintText: 'acme',
                      helperText: 'Lowercase letters, numbers, underscores. Used to sign in.',
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Company code is required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _companyNameController,
                    decoration: const InputDecoration(labelText: 'Company name'),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Company name is required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _companyEmailController,
                    decoration: const InputDecoration(labelText: 'Company email'),
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Company email is required' : null,
                  ),
                  const SizedBox(height: 24),
                  Text('Admin account', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _adminNameController,
                    decoration: const InputDecoration(labelText: 'Your name'),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Name is required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _adminEmailController,
                    decoration: const InputDecoration(labelText: 'Your email'),
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Email is required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _adminPasswordController,
                    decoration: const InputDecoration(labelText: 'Password', helperText: 'At least 8 characters'),
                    obscureText: true,
                    onFieldSubmitted: (_) => _submit(),
                    validator: (v) => (v == null || v.length < 8) ? 'Password must be at least 8 characters' : null,
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: _isSubmitting ? null : _submit,
                    child: _isSubmitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Create workspace'),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: _isSubmitting ? null : () => context.pop(),
                    child: const Text('Already have a workspace? Sign in'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
